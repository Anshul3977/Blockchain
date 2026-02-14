import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { SKALE_EXPLORER } from "@/lib/contracts";
import type { Order } from "@/lib/mockData";

interface OrderCardProps {
  order: Order;
  onCancel: (id: number) => void;
  onViewReceipt: (order: Order) => void;
}

const fmt = (n: number) => n.toLocaleString("en-US");
const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const OrderCard = ({ order, onCancel, onViewReceipt }: OrderCardProps) => {
  const explorerTxUrl = order.txHash
    ? `${SKALE_EXPLORER}/tx/${order.txHash}`
    : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">Order #{order.id}</span>
          {order.isDemo && (
            <span
              style={{
                display: "inline-block",
                padding: "0.1rem 0.4rem",
                borderRadius: "9999px",
                border: "1px solid hsl(45 100% 50% / 0.4)",
                background: "hsl(45 100% 50% / 0.12)",
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "hsl(45 100% 60%)",
                letterSpacing: "0.06em",
                lineHeight: 1.4,
              }}
            >
              DEMO
            </span>
          )}
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mb-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Limit</p>
          <p className="font-mono font-semibold text-foreground">
            {order.limitPrice > 0 ? `$${order.limitPrice.toFixed(2)}` : "Encrypted"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="font-mono font-semibold text-foreground">
            {order.amount > 0 ? fmtUSD(order.amount) : "Encrypted"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {order.status === "executed" ? "Executed At" : "Submitted"}
          </p>
          <p className="font-mono font-semibold text-foreground">
            {order.status === "executed" && order.executionPrice
              ? `$${order.executionPrice.toFixed(2)}`
              : new Date(order.submittedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {order.status === "executed" && order.savings && (
        <p className="mb-3 text-lg font-bold text-primary">
          Saved: {fmtUSD(order.savings)}
        </p>
      )}

      <div className="flex gap-2">
        {order.status === "waiting" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(order.id)}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            Cancel Order
          </Button>
        )}

        {/* Show View Receipt for executed orders or any order with txHash */}
        {(order.status === "executed" || order.txHash) && (
          <Button variant="outline" size="sm" onClick={() => onViewReceipt(order)}>
            View Receipt
          </Button>
        )}

        {/* Show View Tx for executed orders or when txHash exists */}
        {(order.status === "executed" || explorerTxUrl) && (
          <Button variant="ghost" size="sm" className="text-accent" asChild>
            <a
              href={explorerTxUrl || `${SKALE_EXPLORER}/address/${import.meta.env.VITE_ORDERBOOK_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
            >
              View Tx <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
