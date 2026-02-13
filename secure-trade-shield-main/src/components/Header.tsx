import { useState, useEffect, useRef } from "react";
import { Shield, LogOut, Wallet } from "lucide-react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { CONTRACTS, ORACLE_ABI, USDC_ABI } from "@/lib/contracts";
import { useWallet } from "@/hooks/useWallet";
import SkaleBadge from "@/components/SkaleBadge";

interface HeaderProps {
  isConnected: boolean;
  shortAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  connecting: boolean;
  isDemo?: boolean;
  onConnectReal?: () => void;
}

const Header = ({
  isConnected,
  shortAddress,
  onConnect,
  onDisconnect,
  connecting,
  isDemo = false,
  onConnectReal,
}: HeaderProps) => {
  const { provider, address } = useWallet();
  const [price, setPrice] = useState<string | null>(null);
  const [priceError, setPriceError] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const priceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const balanceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch Oracle price — poll every 10s (skip in demo mode)
  useEffect(() => {
    if (isDemo) {
      setPrice("0.65");
      setPriceError(false);
      return;
    }

    if (!isConnected || !provider) {
      setPrice(null);
      setPriceError(false);
      return;
    }

    const fetchPrice = async () => {
      try {
        const contract = new ethers.Contract(CONTRACTS.oracle, ORACLE_ABI, provider);
        const rawPrice: bigint = await contract.price();
        const formatted = (Number(rawPrice) / 100).toFixed(2);
        setPrice(formatted);
        setPriceError(false);
      } catch (err) {
        console.error("Failed to fetch oracle price:", err);
        setPriceError(true);
      }
    };

    fetchPrice();
    priceIntervalRef.current = setInterval(fetchPrice, 10_000);

    return () => {
      if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
    };
  }, [isConnected, provider, isDemo]);

  // Fetch USDC balance — poll every 30s (skip in demo mode)
  useEffect(() => {
    if (isDemo) {
      setUsdcBalance("2,500,000");
      return;
    }

    if (!isConnected || !provider || !address) {
      setUsdcBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const contract = new ethers.Contract(CONTRACTS.usdc, USDC_ABI, provider);
        const raw: bigint = await contract.balanceOf(address);
        // MockUSDC has 6 decimals like real USDC
        const formatted = ethers.formatUnits(raw, 6);
        setUsdcBalance(parseFloat(formatted).toLocaleString("en-US", { maximumFractionDigits: 2 }));
      } catch (err) {
        console.error("Failed to fetch USDC balance, falling back to sFUEL:", err);
        try {
          const sFuelBal = await provider.getBalance(address);
          const formatted = parseFloat(ethers.formatEther(sFuelBal)).toFixed(4);
          setUsdcBalance(`${formatted} sFUEL`);
        } catch {
          setUsdcBalance(null);
        }
      }
    };

    fetchBalance();
    balanceIntervalRef.current = setInterval(fetchBalance, 30_000);

    return () => {
      if (balanceIntervalRef.current) clearInterval(balanceIntervalRef.current);
    };
  }, [isConnected, provider, address, isDemo]);

  const displayPrice = priceError
    ? "Price unavailable"
    : price !== null
      ? `$${price}`
      : "...";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">Private Orders</span>
        </div>

        <div className="flex items-center gap-3">
          <SkaleBadge />

          {isConnected && (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm text-muted-foreground">
                {isDemo ? "Demo:" : "Price:"}
              </span>
              <span className="font-mono text-sm font-semibold text-primary">
                {displayPrice}
              </span>
            </div>
          )}

          {isConnected && usdcBalance !== null && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-xs text-foreground">
                {usdcBalance.includes("sFUEL") ? usdcBalance : `${usdcBalance} USDC`}
              </span>
            </div>
          )}

          {/* Demo Mode badge */}
          {isConnected && isDemo && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.2rem 0.5rem",
                borderRadius: "9999px",
                border: "1px solid hsl(45 100% 50% / 0.4)",
                background: "hsl(45 100% 50% / 0.1)",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "hsl(45 100% 60%)",
                letterSpacing: "0.05em",
              }}
            >
              ⚡ Demo Mode
            </span>
          )}

          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-secondary px-3 py-1.5 font-mono text-xs text-foreground">
                {shortAddress}
              </span>
              {isDemo && onConnectReal ? (
                <Button
                  onClick={onConnectReal}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                >
                  Connect Real Wallet
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDisconnect}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Disconnect wallet"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <Button
              onClick={onConnect}
              disabled={connecting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
