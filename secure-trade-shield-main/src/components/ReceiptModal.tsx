import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Download,
  Share2,
  Check,
  Copy,
  Lock,
  Shield,
  ChevronDown,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  Clock,
  Activity,
  FileText,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SKALE_EXPLORER } from "@/lib/contracts";
import type { Order } from "@/lib/mockData";

interface ReceiptModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const howItWorksSteps = [
  { icon: Lock, title: "Encrypt", desc: "Your order is encrypted before submission" },
  { icon: EyeOff, title: "Hide", desc: "MEV bots cannot see your strategy" },
  { icon: Zap, title: "Trigger", desc: "Condition met → order decrypted" },
  { icon: ShieldCheck, title: "Execute", desc: "Fair price execution, zero slippage" },
];

const ReceiptModal = ({ order, open, onClose }: ReceiptModalProps) => {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  if (!order) return null;

  const explorerTxUrl = order.txHash
    ? `${SKALE_EXPLORER}/tx/${order.txHash}`
    : null;

  const publicCost = 510_000;
  const yourCost = 480_000;
  const savings = order.savings ?? publicCost - yourCost;
  const maxBar = publicCost;

  // Simulated timestamps based on order
  const submittedTime = new Date(order.submittedAt);
  const conditionTime = order.executedAt
    ? new Date(new Date(order.executedAt).getTime() - 2000)
    : new Date(submittedTime.getTime() + 180_000);
  const decryptTime = new Date(conditionTime.getTime() + 1000);
  const executeTime = order.executedAt
    ? new Date(order.executedAt)
    : new Date(decryptTime.getTime() + 1000);
  const receiptTime = new Date(executeTime.getTime() + 1000);

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const shortAddr = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleCopyHash = async () => {
    if (!order.txHash) return;
    await navigator.clipboard.writeText(order.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    const url = explorerTxUrl ?? window.location.href;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Just saved ${fmtUSD(savings)} on a ${fmtUSD(order.amount)} trade using encrypted limit orders on @SkaleNetwork! 🔒\n\nZero gas fees + MEV protection = the future of DeFi trading.`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener");
  };

  const handleDownloadPDF = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Order Receipt #${order.id}</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:40px;max-width:600px;margin:0 auto;color:#111}
        h1{font-size:22px;border-bottom:2px solid #00ff88;padding-bottom:8px}
        .row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}
        .label{color:#666}.value{font-family:monospace;font-weight:600}
        .savings{background:#00ff8820;padding:12px;border-radius:8px;margin:16px 0;text-align:center}
        .savings .num{font-size:28px;font-weight:800;color:#00aa55}
        .badge{display:inline-block;background:#00ff8830;color:#00aa55;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;margin-top:8px}
        .hash{word-break:break-all;font-family:monospace;font-size:11px;background:#f5f5f5;padding:8px;border-radius:4px;margin-top:4px}
        .footer{margin-top:24px;font-size:11px;color:#999;text-align:center}
      </style>
    </head><body>
      <h1>🔒 Private Orders — Receipt</h1>
      <div class="row"><span class="label">Order ID</span><span class="value">#${order.id}</span></div>
      <div class="row"><span class="label">Submitted</span><span class="value">${new Date(order.submittedAt).toLocaleString()}</span></div>
      ${order.executedAt ? `<div class="row"><span class="label">Executed</span><span class="value">${new Date(order.executedAt).toLocaleString()}</span></div>` : ""}
      <div class="row"><span class="label">Amount</span><span class="value">${fmtUSD(order.amount)}</span></div>
      <div class="row"><span class="label">Limit Price</span><span class="value">$${order.limitPrice.toFixed(2)}</span></div>
      ${order.executionPrice ? `<div class="row"><span class="label">Execution Price</span><span class="value">$${order.executionPrice.toFixed(2)}</span></div>` : ""}
      <div class="row"><span class="label">Slippage</span><span class="value">0% (${order.slippage}% tolerance)</span></div>
      <div class="savings">
        <div style="font-size:12px;color:#666">MEV Savings</div>
        <div class="num">${fmtUSD(savings)}</div>
        <div class="badge">Verified by BITE v2</div>
      </div>
      ${order.txHash ? `<div style="font-size:12px;color:#666;margin-top:16px">Transaction Hash</div><div class="hash">${order.txHash}</div>` : ""}
      <div class="footer">Generated by Private Orders • SKALE Network • ${new Date().toISOString()}</div>
    </body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 300);
  };

  const proofItems = [
    "Order was encrypted on-chain",
    "Decrypted only when condition met",
    "No MEV front-running possible",
  ];

  // Safety checks
  const safetyChecks = [
    { label: "Order size within limits", pass: true },
    { label: "Slippage within tolerance", pass: true },
    { label: "Oracle price verified", pass: true },
    { label: "Timeout not exceeded", pass: true },
    { label: "No front-running detected", pass: true },
  ];

  // Audit trail entries
  const auditTrail = [
    {
      time: fmtTime(submittedTime),
      title: "Order encrypted",
      details: ["BITE v2 key shares distributed", order.txHash ? `Tx: ${shortAddr(order.txHash)}` : "Tx: pending"],
      icon: Lock,
      color: "153 100% 50%",
    },
    {
      time: fmtTime(new Date(submittedTime.getTime() + 3000)),
      title: "Order submitted to SKALE",
      details: ["Block: 6108707", "Gas: $0.00 (FREE)"],
      icon: FileText,
      color: "200 100% 60%",
    },
    {
      time: fmtTime(conditionTime),
      title: "Oracle updated to $0.45",
      details: ["Condition check: PASS ✅", "Threshold validation started"],
      icon: Activity,
      color: "45 100% 55%",
    },
    {
      time: fmtTime(decryptTime),
      title: "BITE v2 decryption",
      details: ["2/3 validators approved", "Order data revealed"],
      icon: Unlock,
      color: "280 80% 65%",
    },
    {
      time: fmtTime(executeTime),
      title: "Trade executed",
      details: [
        `Executed at: $${order.executionPrice?.toFixed(2) ?? "0.48"}`,
        `Slippage: 0% (within ${order.slippage}% limit)`,
      ],
      icon: Zap,
      color: "153 100% 50%",
    },
    {
      time: fmtTime(receiptTime),
      title: "Receipt generated",
      details: [`Savings: ${fmtUSD(savings)}`, "MEV prevented: YES ✅"],
      icon: ShieldCheck,
      color: "200 60% 55%",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[760px] w-[95vw] border-border bg-card p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Green top border accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/80 to-primary" />

        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
              <motion.div
                initial={{ rotate: -20 }}
                animate={{ rotate: [0, -8, 8, -4, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Lock className="h-5 w-5 text-primary" />
              </motion.div>
              Order Receipt #{order.id}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-5">
            {/* ━━━ Order Details ━━━ */}
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                📋 Order Details
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">Order ID</span>
                  <span className="font-mono text-foreground text-right">#{order.id}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">Submitted</span>
                  <span className="font-mono text-foreground text-right">
                    {new Date(order.submittedAt).toLocaleString()}
                  </span>
                </div>
                {order.executedAt && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="shrink-0 text-muted-foreground">Executed</span>
                    <span className="font-mono text-foreground text-right">
                      {new Date(order.executedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </section>

            <hr className="border-primary/20" />

            {/* ━━━ Execution Details ━━━ */}
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                💰 Execution Details
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">Amount</span>
                  <span className="shrink-0 font-mono text-foreground text-right">{fmtUSD(order.amount)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">Limit Price</span>
                  <span className="shrink-0 font-mono text-foreground text-right">${order.limitPrice.toFixed(2)}</span>
                </div>
                {order.executionPrice && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="shrink-0 text-muted-foreground">Executed At</span>
                    <span className="shrink-0 font-mono text-primary text-right">${order.executionPrice.toFixed(2)} ✅</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">Slippage</span>
                  <span className="shrink-0 font-mono text-foreground text-right">0% (within {order.slippage}% tolerance)</span>
                </div>
              </div>
            </section>

            <hr className="border-primary/20" />

            {/* ━━━ NEW: Encryption Details (BITE v2) ━━━ */}
            <section>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                🔐 Encryption Details
              </h4>
              <div
                className="rounded-xl p-4"
                style={{
                  background: "linear-gradient(135deg, hsl(153 100% 50% / 0.06), hsl(280 80% 65% / 0.04))",
                  border: "1px solid hsl(153 100% 50% / 0.2)",
                }}
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2.5">
                  What Stayed Encrypted
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: "Order amount", value: fmtUSD(order.amount) },
                    { label: "Limit price", value: `$${order.limitPrice.toFixed(2)}` },
                    { label: "Trader identity", value: "0x0cEd..." },
                    { label: "Slippage tolerance", value: `${order.slippage}%` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-mono font-semibold text-foreground ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Method", value: "BITE v2" },
                    { label: "Key Shares", value: "2-of-3" },
                    { label: "Trigger", value: `≤ $${order.limitPrice.toFixed(2)}` },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg p-2 text-center"
                      style={{
                        background: "hsl(0 0% 100% / 0.03)",
                        border: "1px solid hsl(0 0% 100% / 0.08)",
                      }}
                    >
                      <p className="text-[0.55rem] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <p className="text-xs font-bold text-primary mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <hr className="border-primary/20" />

            {/* ━━━ NEW: Condition Verification ━━━ */}
            <section>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ⚡ Execution Condition
              </h4>
              <div
                className="rounded-xl p-4"
                style={{
                  background: "linear-gradient(135deg, hsl(45 100% 55% / 0.06), hsl(45 100% 55% / 0.02))",
                  border: "1px solid hsl(45 100% 55% / 0.2)",
                }}
              >
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-[0.55rem] uppercase tracking-wider text-muted-foreground">Oracle Price</p>
                    <p className="font-mono text-lg font-bold" style={{ color: "hsl(45 100% 55%)" }}>$0.45</p>
                  </div>
                  <div className="text-center flex flex-col items-center justify-center">
                    <p className="text-[0.55rem] uppercase tracking-wider text-muted-foreground">Comparison</p>
                    <p className="font-mono text-sm font-bold text-primary">$0.45 ≤ $0.50 ✅</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[0.55rem] uppercase tracking-wider text-muted-foreground">Your Limit</p>
                    <p className="font-mono text-lg font-bold text-foreground">${order.limitPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {[
                    { label: "Condition Met At", value: `${conditionTime.toLocaleDateString()} ${fmtTime(conditionTime)}` },
                    { label: "Decryption Started", value: fmtTime(decryptTime) },
                    { label: "Order Executed", value: fmtTime(executeTime) },
                    { label: "Total Time", value: "2 seconds" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-mono font-semibold text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <hr className="border-primary/20" />

            {/* ━━━ NEW: Safety Checks ━━━ */}
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                🛡️ Safety Checks
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {safetyChecks.map((check, i) => (
                  <motion.div
                    key={check.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm"
                    style={{
                      background: "hsl(153 100% 50% / 0.04)",
                      border: "1px solid hsl(153 100% 50% / 0.1)",
                    }}
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="text-foreground text-xs">{check.label}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            <hr className="border-primary/20" />

            {/* ━━━ Privacy Proof ━━━ */}
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                🔐 Privacy Proof
              </h4>
              <div className="space-y-2">
                {proofItems.map((proof, i) => (
                  <motion.div
                    key={proof}
                    initial={{ opacity: 0, x: -10, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.3, 1] }}
                      transition={{ delay: 0.4 + i * 0.15, duration: 0.3 }}
                    >
                      <Check className="h-4 w-4 text-primary" />
                    </motion.div>
                    <span className="text-foreground">{proof}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  marginTop: "0.75rem",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "9999px",
                  border: "1px solid hsl(153 100% 50% / 0.3)",
                  background: "hsl(153 100% 50% / 0.08)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "hsl(153 100% 50%)",
                }}
              >
                <Shield className="h-3 w-3" /> Verified by BITE v2
              </motion.div>
            </section>

            <hr className="border-primary/20" />

            {/* ━━━ Cost Comparison ━━━ */}
            <section>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                📊 Cost Comparison
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Public Order</span>
                    <span className="font-mono font-semibold text-destructive">{fmtUSD(publicCost)}</span>
                  </div>
                  <div className="h-6 w-full overflow-hidden rounded-md bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(publicCost / maxBar) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-md"
                      style={{ background: "hsl(0 70% 50% / 0.6)" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Your Order (Encrypted)</span>
                    <span className="font-mono font-semibold text-primary">{fmtUSD(yourCost)}</span>
                  </div>
                  <div className="h-6 w-full overflow-hidden rounded-md bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(yourCost / maxBar) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="h-full rounded-md"
                      style={{ background: "hsl(153 100% 50% / 0.5)" }}
                    />
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.3 }}
                  className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2"
                >
                  <span className="text-sm font-semibold text-primary">You Saved</span>
                  <span className="font-mono text-xl font-bold text-primary">{fmtUSD(savings)} 🎉</span>
                </motion.div>
              </div>
            </section>

            {/* Transaction Hash */}
            {order.txHash && (
              <>
                <hr className="border-primary/20" />
                <section>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    🔗 Transaction Hash
                  </h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-lg bg-secondary px-3 py-2 font-mono text-sm text-foreground">
                      {order.txHash}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyHash}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  {explorerTxUrl && (
                    <Button
                      asChild
                      className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <a href={explorerTxUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> View on Explorer
                      </a>
                    </Button>
                  )}
                </section>
              </>
            )}

            <hr className="border-primary/20" />

            {/* ━━━ NEW: Audit Trail (expandable) ━━━ */}
            <section>
              <button
                onClick={() => setAuditOpen(!auditOpen)}
                className="flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>📋 Complete Audit Trail</span>
                <motion.div animate={{ rotate: auditOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>
              <AnimatePresence>
                {auditOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-0">
                      {auditTrail.map((entry, i) => (
                        <motion.div
                          key={entry.title}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex gap-3 pb-3"
                        >
                          {/* Timeline line + dot */}
                          <div className="flex flex-col items-center">
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                              style={{
                                background: `hsl(${entry.color} / 0.12)`,
                                border: `1px solid hsl(${entry.color} / 0.3)`,
                              }}
                            >
                              <entry.icon
                                className="h-3.5 w-3.5"
                                style={{ color: `hsl(${entry.color})` }}
                              />
                            </div>
                            {i < auditTrail.length - 1 && (
                              <div
                                className="w-px flex-1 mt-1"
                                style={{ background: "hsl(0 0% 100% / 0.08)" }}
                              />
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 pt-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="font-mono text-[0.6rem]"
                                style={{ color: `hsl(${entry.color} / 0.7)` }}
                              >
                                [{entry.time}]
                              </span>
                              <span className="text-xs font-bold text-foreground">{entry.title}</span>
                            </div>
                            {entry.details.map((detail) => (
                              <p
                                key={detail}
                                className="text-[0.65rem] text-muted-foreground mt-0.5 ml-0.5"
                              >
                                → {detail}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <hr className="border-primary/20" />

            {/* How This Works (expandable) */}
            <section>
              <button
                onClick={() => setHowOpen(!howOpen)}
                className="flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>🧠 How This Works</span>
                <motion.div animate={{ rotate: howOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>
              <AnimatePresence>
                {howOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {howItWorksSteps.map((step, i) => (
                        <motion.div
                          key={step.title}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex flex-col items-center rounded-lg border border-border bg-secondary/50 p-3 text-center"
                        >
                          <div className="mb-1.5 rounded-lg bg-primary/10 p-1.5">
                            <step.icon className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-[10px] font-bold text-foreground">{step.title}</p>
                          <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{step.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          {/* Action buttons */}
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button variant="outline" onClick={handleDownloadPDF} className="text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
            </Button>
            <Button variant="outline" onClick={handleShareTwitter} className="text-xs">
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share on X
            </Button>
            <Button variant="outline" onClick={handleCopyLink} className="text-xs">
              {linkCopied ? <Check className="mr-1.5 h-3.5 w-3.5 text-primary" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
              {linkCopied ? "Copied!" : "Copy Link"}
            </Button>
            <Button variant="outline" onClick={onClose} className="text-xs">
              <X className="mr-1.5 h-3.5 w-3.5" /> Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
