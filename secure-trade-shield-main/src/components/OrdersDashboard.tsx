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

const OrdersDashboard = ({ localOrders, onCancel }: OrdersDashboardProps) => {
  const { provider, isConnected } = useWallet();
  const [chainOrders, setChainOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!provider) return;

    setLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(CONTRACTS.orderBook, ORDERBOOK_ABI, provider);
      const count: bigint = await contract.orderCount();
      const total = Number(count);

      // Fetch OrderPlaced events to get txHash for each order
      const eventFilter = contract.filters.OrderPlaced();
      let events: ethers.Log[] = [];
      try {
        events = await contract.queryFilter(eventFilter);
      } catch {
        // If event query fails, continue without txHash
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
        } catch {
          // Skip unparseable logs
        }
      }

      const fetched: Order[] = [];
      for (let i = 0; i < total; i++) {
        const raw = await contract.orders(i);
        fetched.push({
          id: i,
          amount: 0, // encrypted — not readable on-chain
          limitPrice: 0,
          slippage: 0,
          status: raw.executed ? "executed" : "waiting",
          submittedAt: new Date(Number(raw.timestamp) * 1000).toISOString(),
          txHash: txHashMap.get(i),
        });
      }

      setChainOrders(fetched);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders from contract.");
    } finally {
      setLoading(false);
    }
  }, [provider]);

  // Fetch on mount + poll every 30s
  useEffect(() => {
    if (!isConnected || !provider) {
      setChainOrders([]);
      return;
    }

    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isConnected, provider, fetchOrders]);

  // Merge: local session orders first, then on-chain orders (de-duped by id)
  const localIds = new Set(localOrders.map((o) => o.id));
  const mergedOrders = [
    ...localOrders,
    ...chainOrders.filter((o) => !localIds.has(o.id)),
  ];

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
