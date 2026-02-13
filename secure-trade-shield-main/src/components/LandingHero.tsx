import { motion } from "framer-motion";
import { Lock, Zap, Shield, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  onConnect: () => void;
  connecting: boolean;
  onDemoConnect: () => void;
}

const stats = [
  { icon: Zap, label: "Zero Gas", description: "No gas fees on SKALE network" },
  { icon: Shield, label: "MEV Protected", description: "Orders hidden from bots" },
  { icon: Brain, label: "AI Powered", description: "Intelligent order execution" },
];

const LandingHero = ({ onConnect, connecting, onDemoConnect }: LandingHeroProps) => {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        {/* Larger animated lock */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
          className="mb-8"
        >
          <div className="rounded-2xl bg-primary/10 p-5 animate-pulse-glow">
            <Lock className="h-16 w-16 text-primary drop-shadow-[0_0_12px_hsl(153,100%,50%,0.6)]" />
          </div>
        </motion.div>

        {/* Green subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-3 text-sm font-semibold tracking-wider uppercase"
          style={{ color: "hsl(153 100% 50%)", letterSpacing: "0.15em" }}
        >
          Privacy-Preserving Limit Orders on SKALE
        </motion.p>

        {/* Main headline */}
        <h1 className="mb-4 max-w-3xl text-4xl font-extrabold tracking-tight text-gradient-hero sm:text-5xl md:text-6xl">
          Stop Losing Thousands to MEV Bots
        </h1>

        {/* Updated description */}
        <p className="mb-8 max-w-xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Large traders lose <strong className="text-foreground">$2B annually</strong> to MEV front-running.
          We built the solution: encrypted limit orders using SKALE's BITE v2 that hide your strategy
          until execution. <strong className="text-foreground">Zero gas fees. Guaranteed savings.</strong>
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={onConnect}
            disabled={connecting}
            size="lg"
            className="h-14 px-10 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow rounded-xl"
          >
            {connecting ? "Connecting..." : "Start Saving Money →"}
          </Button>

          <Button
            onClick={onDemoConnect}
            variant="outline"
            size="lg"
            className="h-11 px-8 text-sm font-medium border-primary/40 text-primary hover:bg-primary/10 rounded-xl"
          >
            Try Demo Mode →
          </Button>
        </div>

        {/* Trust indicators */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 text-xs text-muted-foreground"
          style={{ letterSpacing: "0.03em" }}
        >
          ✓ 100% MEV Protected &nbsp;&nbsp; ✓ Zero Gas Fees &nbsp;&nbsp; ✓ Live on SKALE Testnet
        </motion.p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-10 mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl border border-border bg-card p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:glow-green-sm"
          >
            <stat.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-1 text-sm font-semibold text-foreground">{stat.label}</h3>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default LandingHero;
