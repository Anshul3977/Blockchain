import { Lock, Check, X } from "lucide-react";

interface StatusBadgeProps {
  status: "waiting" | "executed" | "cancelled";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  if (status === "waiting") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning animate-pulse-badge">
        <Lock className="h-3 w-3" />
        Waiting
      </span>
    );
  }

  if (status === "executed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
        <Check className="h-3 w-3" />
        Executed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">
      <X className="h-3 w-3" />
      Cancelled
    </span>
  );
};

export default StatusBadge;
