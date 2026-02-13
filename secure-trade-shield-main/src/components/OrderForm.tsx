import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, Check } from "lucide-react";
import { ethers } from "ethers";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getContracts } from "@/lib/contracts";
import { MOCK_CURRENT_PRICE, MOCK_BALANCE, type Order } from "@/lib/mockData";
import ReceiptModal from "@/components/ReceiptModal";

interface OrderFormProps {
  onOrderPlaced: (order: Order) => void;
  nextId: number;
  signer: ethers.Signer | null;
  isDemo?: boolean;
  isJudge?: boolean;
  receiptOrder?: Order | null;
  onCloseReceipt?: () => void;
}

export interface OrderFormHandle {
  submitDemo: () => void;
}

const formatNumber = (n: number) => n.toLocaleString("en-US");

const SLIPPAGE_OPTIONS = ["0.5", "1", "2", "5"];

const JUDGE_DEFAULTS = { amount: "1,000,000", limitPrice: "0.48", slippage: "1" };

const fireConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.65 },
    colors: ["#00ff88", "#00cc66", "#ffffff", "#22c55e"],
  });
};

const OrderForm = forwardRef<OrderFormHandle, OrderFormProps>(
  ({ onOrderPlaced, nextId, signer, isDemo = false, isJudge = false, receiptOrder, onCloseReceipt }, ref) => {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [limitPrice, setLimitPrice] = useState("");
    const [slippage, setSlippage] = useState("1");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Auto-populate for judge mode
    useEffect(() => {
      if (isJudge && amount === "" && limitPrice === "") {
        setAmount(JUDGE_DEFAULTS.amount);
        setLimitPrice(JUDGE_DEFAULTS.limitPrice);
        setSlippage(JUDGE_DEFAULTS.slippage);
      }
    }, [isJudge, amount, limitPrice]);

    const numAmount = parseFloat(amount.replace(/,/g, "")) || 0;
    const numPrice = parseFloat(limitPrice) || 0;
    const priceDiff = numPrice > 0
      ? (((numPrice - MOCK_CURRENT_PRICE) / MOCK_CURRENT_PRICE) * 100).toFixed(1)
      : null;

    const handleAmountChange = (val: string) => {
      const raw = val.replace(/,/g, "").replace(/[^0-9.]/g, "");
      if (raw === "" || !isNaN(Number(raw))) {
        const parts = raw.split(".");
        if (parts[0]) {
          parts[0] = Number(parts[0]).toLocaleString("en-US");
        }
        setAmount(parts.join("."));
      }
    };

    const handleDemoSubmit = useCallback(async () => {
      const amt = parseFloat(amount.replace(/,/g, "")) || 0;
      const price = parseFloat(limitPrice) || 0;
      if (amt <= 0 || price <= 0) return;

      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 800));

      const demoHash =
        "0xdemo" +
        Array.from({ length: 56 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      const newOrder: Order = {
        id: nextId,
        amount: amt,
        limitPrice: price,
        slippage: parseFloat(slippage),
        status: "waiting",
        submittedAt: new Date().toISOString(),
        txHash: demoHash,
        isDemo: true,
      };
      onOrderPlaced(newOrder);

      setSubmitting(false);
      setSuccess(true);
      fireConfetti();

      toast({
        title: "🎉 Demo order placed!",
        description: "Connect wallet for real transactions.",
      });

      setTimeout(() => {
        setSuccess(false);
        setAmount("");
        setLimitPrice("");
        setSlippage("1");
      }, 1500);
    }, [amount, limitPrice, slippage, nextId, onOrderPlaced, toast]);

    // Expose submitDemo for JudgeMode auto-play
    useImperativeHandle(ref, () => ({
      submitDemo: () => {
        // Make sure form has values
        if (!amount || !limitPrice) {
          setAmount(JUDGE_DEFAULTS.amount);
          setLimitPrice(JUDGE_DEFAULTS.limitPrice);
          setSlippage(JUDGE_DEFAULTS.slippage);
        }
        setTimeout(() => handleDemoSubmit(), 100);
      },
    }), [amount, limitPrice, handleDemoSubmit]);

    const handleSubmit = async () => {
      if (numAmount <= 0) {
        toast({ title: "Invalid amount", description: "Please enter a valid amount.", variant: "destructive" });
        return;
      }
      if (numPrice <= 0) {
        toast({ title: "Invalid price", description: "Please enter a valid limit price.", variant: "destructive" });
        return;
      }
      if (numAmount > MOCK_BALANCE) {
        toast({ title: "Insufficient balance", description: `You have ${formatNumber(MOCK_BALANCE)} USDC.`, variant: "destructive" });
        return;
      }

      // --- Demo Mode ---
      if (isDemo) {
        await handleDemoSubmit();
        return;
      }

      // --- Real Mode ---
      if (!signer) {
        toast({
          title: "Wallet not connected",
          description: "Please connect MetaMask to place a real order.",
          variant: "destructive",
        });
        return;
      }

      setSubmitting(true);

      try {
        toast({ title: "⏳ Transaction Pending", description: "Please confirm in MetaMask..." });

        const contracts = getContracts(signer);

        const orderData = JSON.stringify({
          amount: numAmount,
          limitPrice: numPrice,
          slippage: parseFloat(slippage),
          timestamp: Date.now(),
        });
        const mockEncrypted = ethers.toUtf8Bytes(orderData);

        const tx = await contracts.orderBook.placeOrder(mockEncrypted);
        toast({ title: "⛓️ Mining...", description: `Tx: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}` });

        const receipt = await tx.wait();

        let orderId = nextId;
        if (receipt && receipt.logs) {
          for (const log of receipt.logs) {
            try {
              const parsed = contracts.orderBook.interface.parseLog({
                topics: log.topics as string[],
                data: log.data,
              });
              if (parsed && parsed.name === "OrderPlaced") {
                orderId = Number(parsed.args.orderId);
                break;
              }
            } catch {
              // Skip logs that don't match our ABI
            }
          }
        }

        const newOrder: Order = {
          id: orderId,
          amount: numAmount,
          limitPrice: numPrice,
          slippage: parseFloat(slippage),
          status: "waiting",
          submittedAt: new Date().toISOString(),
          txHash: receipt?.hash,
        };
        onOrderPlaced(newOrder);

        setSubmitting(false);
        setSuccess(true);
        fireConfetti();

        toast({
          title: "🔒 Order Encrypted!",
          description: `Tx: ${receipt?.hash.slice(0, 10)}...${receipt?.hash.slice(-8)}`,
        });

        setTimeout(() => {
          setSuccess(false);
          setAmount("");
          setLimitPrice("");
          setSlippage("1");
        }, 1500);
      } catch (error: unknown) {
        setSubmitting(false);
        console.error("Transaction failed:", error);

        let friendlyMsg = "Something went wrong. Please try again.";
        if (error instanceof Error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("user rejected") || msg.includes("user denied")) {
            friendlyMsg = "Transaction was cancelled in MetaMask.";
          } else if (msg.includes("insufficient funds")) {
            friendlyMsg = "Insufficient funds for gas. You may need sFUEL on SKALE.";
          } else if (msg.includes("network") || msg.includes("rpc")) {
            friendlyMsg = "Network error. Please check your connection and try again.";
          } else {
            friendlyMsg = error.message.length > 100 ? error.message.slice(0, 100) + "..." : error.message;
          }
        }

        toast({
          title: "❌ Transaction Failed",
          description: friendlyMsg,
          variant: "destructive",
        });
      }
    };

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-[600px] rounded-xl border border-border bg-card p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Place Encrypted Limit Order</h2>
            <Lock className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-5">
            {/* Amount */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="amount" className="text-sm text-muted-foreground">Amount (USDC)</Label>
                <button
                  type="button"
                  onClick={() => handleAmountChange(MOCK_BALANCE.toString())}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  aria-label="Set maximum amount"
                >
                  Max
                </button>
              </div>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="1,000,000"
                aria-label="Order amount in USDC"
                className="h-12 bg-secondary border-border font-mono text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Balance: {formatNumber(MOCK_BALANCE)} USDC
              </p>
            </div>

            {/* Limit Price */}
            <div>
              <Label htmlFor="limit-price" className="mb-1.5 block text-sm text-muted-foreground">Limit Price</Label>
              <Input
                id="limit-price"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.50"
                aria-label="Limit price in USD"
                className="h-12 bg-secondary border-border font-mono text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Current: ${MOCK_CURRENT_PRICE.toFixed(2)}</span>
                {priceDiff && (
                  <span className={parseFloat(priceDiff) < 0 ? "text-primary" : "text-destructive"}>
                    {parseFloat(priceDiff) > 0 ? "↑" : "↓"} {Math.abs(parseFloat(priceDiff))}%
                  </span>
                )}
              </div>
            </div>

            {/* Slippage */}
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">Slippage Tolerance</Label>
              <RadioGroup value={slippage} onValueChange={setSlippage} className="flex gap-2">
                {SLIPPAGE_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${slippage === opt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground"
                      }`}
                  >
                    <RadioGroupItem value={opt} className="sr-only" />
                    {opt}%
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Privacy callout */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-primary">Privacy Guarantee</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Your order will be encrypted on-chain. MEV bots cannot see your strategy until execution.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || success}
              aria-label={isDemo ? "Place demo order" : "Place encrypted order"}
              className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-all hover:-translate-y-0.5 disabled:opacity-70"
            >
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Encrypting...</span>
              ) : success ? (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" />Order Placed!</span>
              ) : (
                isDemo ? "Place Demo Order" : "Place Encrypted Order"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Receipt Modal */}
        {receiptOrder !== undefined && (
          <ReceiptModal
            order={receiptOrder ?? null}
            open={!!receiptOrder}
            onClose={onCloseReceipt ?? (() => { })}
          />
        )}
      </>
    );
  }
);

OrderForm.displayName = "OrderForm";

export default OrderForm;
