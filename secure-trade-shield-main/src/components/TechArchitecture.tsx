import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lock,
    Upload,
    Eye,
    Zap,
    CheckCircle,
    ChevronDown,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
    {
        icon: Lock,
        title: "ENCRYPT",
        text: "Order encrypted with BITE v2",
        sub: "Threshold encryption",
    },
    {
        icon: Upload,
        title: "SUBMIT",
        text: "Submitted to SKALE",
        sub: "Zero gas fees",
    },
    {
        icon: Eye,
        title: "MONITOR",
        text: "Oracle watches price",
        sub: "Chainlink integration",
    },
    {
        icon: Zap,
        title: "TRIGGER",
        text: "Condition met, decrypt",
        sub: "Automatic execution",
    },
    {
        icon: CheckCircle,
        title: "EXECUTE",
        text: "Trade executed",
        sub: "On-chain receipt",
    },
];

const techBadges = [
    "SKALE Network",
    "BITE v2",
    "Solidity 0.8.28",
    "React + TypeScript",
    "ethers.js v6",
];

const TechArchitecture = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mx-auto w-full max-w-[1000px] px-4 py-12">
            <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
                    How It Works
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                    Privacy-preserving limit orders in 5 simple steps
                </p>
                <Button
                    variant="outline"
                    onClick={() => setExpanded(!expanded)}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                >
                    {expanded ? "Hide" : "Show"} Technical Details
                    <motion.span
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-2 inline-block"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </motion.span>
                </Button>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="mt-8">
                            {/* 5-step flow */}
                            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-0">
                                {steps.map((step, i) => (
                                    <div key={step.title} className="flex items-center">
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1, duration: 0.35 }}
                                            className="flex flex-col items-center text-center"
                                            style={{ width: "130px" }}
                                        >
                                            <div
                                                style={{
                                                    width: "3rem",
                                                    height: "3rem",
                                                    borderRadius: "0.75rem",
                                                    background: "hsl(153 100% 50% / 0.1)",
                                                    border: "1px solid hsl(153 100% 50% / 0.25)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    marginBottom: "0.5rem",
                                                }}
                                            >
                                                <step.icon
                                                    style={{
                                                        width: "1.25rem",
                                                        height: "1.25rem",
                                                        color: "hsl(153 100% 50%)",
                                                    }}
                                                />
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "0.65rem",
                                                    fontWeight: 700,
                                                    letterSpacing: "0.1em",
                                                    color: "hsl(153 100% 50%)",
                                                    marginBottom: "0.25rem",
                                                }}
                                            >
                                                {step.title}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    color: "hsl(0 0% 98%)",
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {step.text}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "0.625rem",
                                                    color: "hsl(0 0% 100% / 0.4)",
                                                    marginTop: "0.125rem",
                                                }}
                                            >
                                                {step.sub}
                                            </span>
                                        </motion.div>

                                        {/* Arrow connector */}
                                        {i < steps.length - 1 && (
                                            <motion.div
                                                initial={{ opacity: 0, scaleX: 0 }}
                                                animate={{ opacity: 1, scaleX: 1 }}
                                                transition={{ delay: i * 0.1 + 0.15, duration: 0.25 }}
                                                className="hidden sm:block"
                                                style={{
                                                    width: "2rem",
                                                    height: "2px",
                                                    background: "linear-gradient(90deg, hsl(153 100% 50% / 0.6), hsl(153 100% 50% / 0.2))",
                                                    position: "relative",
                                                    marginTop: "-1.5rem",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        right: "-3px",
                                                        top: "-4px",
                                                        fontSize: "10px",
                                                        color: "hsl(153 100% 50% / 0.6)",
                                                    }}
                                                >
                                                    ›
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Tech stack badges */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 flex flex-wrap justify-center gap-2"
                            >
                                {techBadges.map((badge) => (
                                    <span
                                        key={badge}
                                        style={{
                                            display: "inline-block",
                                            padding: "0.3rem 0.75rem",
                                            borderRadius: "9999px",
                                            border: "1px solid hsl(0 0% 100% / 0.1)",
                                            background: "hsl(0 0% 100% / 0.03)",
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "hsl(0 0% 100% / 0.55)",
                                            letterSpacing: "0.02em",
                                        }}
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </motion.div>

                            {/* GitHub button */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.65 }}
                                className="mt-6 flex justify-center"
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs text-muted-foreground border-border hover:text-foreground"
                                    asChild
                                >
                                    <a
                                        href="https://github.com"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                        View GitHub Repo
                                    </a>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TechArchitecture;
