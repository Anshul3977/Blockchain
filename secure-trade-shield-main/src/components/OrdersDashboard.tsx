import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Inbox, Loader2 } from "lucide-react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import OrderCard from "@/components/OrderCard";
import ReceiptModal from "@/components/ReceiptModal";
import { CONTRACTS, ORDERBOOK_ABI } from "@/lib/contracts";
import { useWallet } from "@/hooks/useWallet";
import type { Order } from "@/lib/mockData";

interface OrdersDashboardProps {
  /** Orders placed in the current session (before they appear on-chain) */
  localOrders: Order[];
  onCancel: (id: number) => void;
}

/** Read-only fallback provider (no wallet required) */
const FALLBACK_RPC = import.meta.env.VITE_SKALE_RPC as string;

const OrdersDashboard = ({ localOrders, onCancel }: OrdersDashboardProps) => {
  const { provider, isConnected } = useWallet();
  const [chainOrders, setChainOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async () => {
    // Use wallet provider if available, otherwise fall back to public RPC
    const activeProvider =
      provider || new ethers.JsonRpcProvider(FALLBACK_RPC);

    console.log("[OrdersDashboard] fetchOrders() starting", {
      usingWalletProvider: !!provider,
      rpcUrl: provider ? "MetaMask/BrowserProvider" : FALLBACK_RPC,
      contractAddress: CONTRACTS.orderBook,
    });

    if (!activeProvider) {
      console.warn("[OrdersDashboard] No provider available (wallet or RPC). Skipping fetch.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(CONTRACTS.orderBook, ORDERBOOK_ABI, activeProvider);
      console.log("[OrdersDashboard] Contract instance created");

      const count: bigint = await contract.orderCount();
      const total = Number(count);
      console.log("[OrdersDashboard] orderCount() =", total, "(raw:", count.toString(), ")");

      // Fetch OrderPlaced events to get txHash for each order
      const eventFilter = contract.filters.OrderPlaced();
      let events: ethers.Log[] = [];
      try {
        events = await contract.queryFilter(eventFilter);
        console.log("[OrdersDashboard] OrderPlaced events fetched:", events.length);
      } catch (eventErr) {
        console.warn("[OrdersDashboard] Event query failed (continuing without txHash):", eventErr);
      }

      // Map orderId → txHash from events
      const txHashMap = new Map<number, string>();
      for (const event of events) {
        try {
          const parsed = contract.interface.parseLog({
            topics: event.topics as string[],
            data: event.data,
          });
          if (parsed && parsed.name === "OrderPlaced") {
            txHashMap.set(Number(parsed.args.orderId), event.transactionHash);
          }
        } catch (parseErr) {
          console.warn("[OrdersDashboard] Failed to parse event log:", parseErr);
        }
      }

      const fetched: Order[] = [];
      for (let i = 0; i < total; i++) {
        try {
          const raw = await contract.orders(i);
          console.log(`[OrdersDashboard] Order #${i} raw:`, {
            encryptedData: raw.encryptedData,
            trader: raw.trader,
            timestamp: raw.timestamp?.toString(),
            executed: raw.executed,
          });

          // Decode encrypted data for display
          let limitPrice = 0;
          let amount = 0;
          let slippage = 0;
          try {
            const json = ethers.toUtf8String(raw.encryptedData);
            const parsed = JSON.parse(json);
            console.log(`[OrdersDashboard] Order #${i} decoded:`, parsed);
            if (parsed.limitPriceCents) limitPrice = parsed.limitPriceCents / 100;
            if (parsed.amountUSDC) amount = parsed.amountUSDC;
            if (parsed.slippagePercent) slippage = parsed.slippagePercent;
          } catch (decodeErr) {
            console.warn(`[OrdersDashboard] Order #${i} decode failed (legacy/malformed):`, decodeErr);
          }

          fetched.push({
            id: i,
            amount,
            limitPrice,
            slippage,
            status: raw.executed ? "executed" : "waiting",
            submittedAt: new Date(Number(raw.timestamp) * 1000).toISOString(),
            txHash: txHashMap.get(i),
          });
        } catch (orderErr) {
          console.error(`[OrdersDashboard] Failed to fetch order #${i}:`, orderErr);
        }
      }

      console.log("[OrdersDashboard] Total orders fetched:", fetched.length);
      setChainOrders(fetched);
    } catch (err) {
      console.error("[OrdersDashboard] fetchOrders FAILED:", err);
      setError("Failed to load orders from contract.");
    } finally {
      setLoading(false);
    }
  }, [provider]);

  // Fetch on mount + poll every 5s
  // Orders are public on-chain data, so we fetch even without a wallet connection
  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 5_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchOrders]);

  // Merge: chain data is source of truth for status. Local orders only shown
  // if they haven't appeared on-chain yet (e.g. just submitted, not indexed).
  const chainIds = new Set(chainOrders.map((o) => o.id));
  const mergedOrders = [
    ...chainOrders,
    ...localOrders.filter((o) => !chainIds.has(o.id)),
  ];

  console.log("[OrdersDashboard] render", {
    localOrders: localOrders.length,
    chainOrders: chainOrders.length,
    mergedOrders: mergedOrders.length,
    isConnected,
    hasProvider: !!provider,
  });

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Your Orders ({mergedOrders.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 h-3 w-3" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {mergedOrders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading orders..." : "No orders yet. Place your first encrypted order above."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {mergedOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <OrderCard
                  order={order}
                  onCancel={onCancel}
                  onViewReceipt={setReceiptOrder}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ReceiptModal
        order={receiptOrder}
        open={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
};

export default OrdersDashboard;
