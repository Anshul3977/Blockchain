import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Lock,
    Eye,
    Zap,
    Unlock,
    CheckCircle,
    FileText,
    ArrowRight,
} from "lucide-react";

const lifecycleSteps = [
    {
        icon: Lock,
        emoji: "🔒",
        title: "ENCRYPT",
        headline: "Order encrypted with BITE v2",
        details: [
            "Status: Encrypted on-chain",
            "MEV bots see: ████████████",
            "Strategy hidden from all observers",
        ],
        color: "153 100% 50%",
    },
    {
        icon: Eye,
        emoji: "👁️",
        title: "MONITOR",
        headline: "Agent watches oracle price",
        details: [
            "Current: $0.65 | Limit: $0.50",
            "Condition: Not met (waiting...)",
            "Polling every 10 seconds",
        ],
        color: "200 100% 60%",
    },
    {
        icon: Zap,
        emoji: "⚡",
        title: "TRIGGER",
        headline: "Oracle price drops to $0.45",
        details: [
            "Condition met: $0.45 ≤ $0.50 ✅",
            "Initiating decryption request...",
            "Threshold signature validating",
        ],
        color: "45 100% 55%",
    },
    {
        icon: Unlock,
        emoji: "🔓",
        title: "DECRYPT",
        headline: "BITE v2 reveals order data",
        details: [
            "Threshold nodes validate trigger",
            "Reveals: $1,000,000 @ $0.50",
            "Data visible only after condition",
        ],
        color: "280 80% 65%",
    },
    {
        icon: CheckCircle,
        emoji: "✅",
        title: "EXECUTE",
        headline: "Trade completes at fair price",
        details: [
            "Executed at $0.48 (no front-run)",
            "Zero slippage achieved",
            "Savings: $30,000 protected",
        ],
        color: "153 100% 50%",
    },
    {
        icon: FileText,
        emoji: "📄",
        title: "RECEIPT",
        headline: "Auditable proof generated",
        details: [
            "Tx: 0xABCD...1234 on SKALE",
            "Full lifecycle audit trail",
            "Verifiable on block explorer",
        ],
        color: "200 60% 55%",
    },
];

const EncryptedLifecycle = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % lifecycleSteps.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    return (
        <div className="mx-auto w-full max-w-[1100px] px-4 py-16">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
            >
                <p
                    className="mb-2 text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: "hsl(153 100% 50%)" }}
                >
                    Full Lifecycle Demo
                </p>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl mb-2">
                    Encrypted Agent Lifecycle
                </h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                    From encryption to execution — see how BITE v2 protects every step of
                    your trade from MEV front-running.
                </p>
            </motion.div>

            {/* Step indicator bar */}
            <div className="flex items-center justify-center gap-1.5 mb-8 flex-wrap">
                {lifecycleSteps.map((step, i) => (
                    <button
                        key={step.title}
                        onClick={() => {
                            setActiveStep(i);
                            setIsAutoPlaying(false);
                        }}
                        className="flex items-center gap-1 group"
                    >
                        <div
                            className="flex items-center justify-center rounded-lg transition-all duration-300"
                            style={{
                                width: i === activeStep ? "2.5rem" : "2rem",
                                height: i === activeStep ? "2.5rem" : "2rem",
                                background:
                                    i === activeStep
                                        ? `hsl(${step.color} / 0.2)`
                                        : "hsl(0 0% 100% / 0.05)",
                                border: `1.5px solid ${i === activeStep
                                        ? `hsl(${step.color} / 0.6)`
                                        : "hsl(0 0% 100% / 0.1)"
                                    }`,
                                boxShadow:
                                    i === activeStep
                                        ? `0 0 20px hsl(${step.color} / 0.2)`
                                        : "none",
                            }}
                        >
                            <step.icon
                                style={{
                                    width: i === activeStep ? "1.1rem" : "0.85rem",
                                    height: i === activeStep ? "1.1rem" : "0.85rem",
                                    color:
                                        i === activeStep
                                            ? `hsl(${step.color})`
                                            : "hsl(0 0% 100% / 0.3)",
                                    transition: "all 0.3s",
                                }}
                            />
                        </div>
                        {i < lifecycleSteps.length - 1 && (
                            <ArrowRight
                                style={{
                                    width: "0.75rem",
                                    height: "0.75rem",
                                    color:
                                        i < activeStep
                                            ? `hsl(${lifecycleSteps[i + 1].color} / 0.5)`
                                            : "hsl(0 0% 100% / 0.1)",
                                    transition: "color 0.3s",
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Active step detail card */}
            <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 15, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mx-auto max-w-2xl"
            >
                <div
                    className="rounded-2xl p-6 sm:p-8"
                    style={{
                        background: `linear-gradient(135deg, hsl(${lifecycleSteps[activeStep].color} / 0.06), hsl(${lifecycleSteps[activeStep].color} / 0.02))`,
                        border: `1px solid hsl(${lifecycleSteps[activeStep].color} / 0.2)`,
                        boxShadow: `0 4px 40px hsl(${lifecycleSteps[activeStep].color} / 0.08)`,
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{
                                background: `hsl(${lifecycleSteps[activeStep].color} / 0.15)`,
                                border: `1px solid hsl(${lifecycleSteps[activeStep].color} / 0.3)`,
                            }}
                        >
                            <span className="text-xl">
                                {lifecycleSteps[activeStep].emoji}
                            </span>
                        </div>
                        <div>
                            <p
                                className="text-[0.65rem] font-bold uppercase tracking-[0.15em]"
                                style={{
                                    color: `hsl(${lifecycleSteps[activeStep].color})`,
                                }}
                            >
                                Step {activeStep + 1} of {lifecycleSteps.length}  —{" "}
                                {lifecycleSteps[activeStep].title}
                            </p>
                            <h3 className="text-lg font-bold text-foreground">
                                {lifecycleSteps[activeStep].headline}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-2.5 mt-5">
                        {lifecycleSteps[activeStep].details.map((detail, i) => (
                            <motion.div
                                key={detail}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 + i * 0.1, duration: 0.3 }}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                                    style={{
                                        background: `hsl(${lifecycleSteps[activeStep].color})`,
                                        boxShadow: `0 0 6px hsl(${lifecycleSteps[activeStep].color} / 0.5)`,
                                    }}
                                />
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: "hsl(0 0% 100% / 0.75)" }}
                                >
                                    {detail}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6 h-1 w-full rounded-full overflow-hidden bg-white/5">
                        <motion.div
                            key={`progress-${activeStep}`}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3, ease: "linear" }}
                            className="h-full rounded-full"
                            style={{
                                background: `linear-gradient(90deg, hsl(${lifecycleSteps[activeStep].color} / 0.8), hsl(${lifecycleSteps[activeStep].color} / 0.3))`,
                            }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Bottom timeline dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
                {lifecycleSteps.map((step, i) => (
                    <button
                        key={step.title}
                        onClick={() => {
                            setActiveStep(i);
                            setIsAutoPlaying(false);
                        }}
                        className="rounded-full transition-all duration-300"
                        style={{
                            width: i === activeStep ? "1.5rem" : "0.5rem",
                            height: "0.5rem",
                            background:
                                i === activeStep
                                    ? `hsl(${step.color})`
                                    : "hsl(0 0% 100% / 0.15)",
                            boxShadow:
                                i === activeStep
                                    ? `0 0 8px hsl(${step.color} / 0.5)`
                                    : "none",
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default EncryptedLifecycle;
