import { motion } from "framer-motion";
import { Eye, EyeOff, Bot, ShieldCheck, AlertTriangle, Check } from "lucide-react";
import SavingsCounter from "@/components/SavingsCounter";

const publicSteps = [
  { icon: Eye, text: "Order visible on-chain" },
  { icon: Bot, text: "MEV bot detects order" },
  { icon: AlertTriangle, text: "Bot front-runs your trade" },
  { icon: AlertTriangle, text: "You pay inflated price: $0.51" },
];

const encryptedSteps = [
  { icon: EyeOff, text: "Order encrypted on-chain" },
  { icon: ShieldCheck, text: "MEV bot sees nothing" },
  { icon: Check, text: "Direct execution at target" },
  { icon: Check, text: "You pay fair price: $0.48" },
];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.5 } },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const MEVComparison = () => {
  return (
    <div className="mx-auto w-full max-w-[1000px] py-16 px-4">
      <h2 className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl">
        MEV Protection Demonstration
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Public */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
        >
          <h3 className="mb-4 text-lg font-bold text-destructive">Public Order ❌</h3>
          <div className="space-y-3">
            {publicSteps.map((step, i) => (
              <motion.div key={i} variants={item} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <step.icon className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-sm text-foreground">{step.text}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 border-t border-destructive/20 pt-4">
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="font-mono text-2xl font-bold text-destructive">$510,000</p>
          </div>
        </motion.div>

        {/* Encrypted */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-6"
        >
          <h3 className="mb-4 text-lg font-bold text-primary">Encrypted Order ✅</h3>
          <div className="space-y-3">
            {encryptedSteps.map((step, i) => (
              <motion.div key={i} variants={item} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{step.text}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 border-t border-primary/20 pt-4">
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="font-mono text-2xl font-bold text-primary">$480,000</p>
          </div>
        </motion.div>
      </div>

      <SavingsCounter />
    </div>
  );
};

export default MEVComparison;
