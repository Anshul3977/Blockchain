import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    SkipForward,
    RotateCcw,
    X,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

const DEMO_STEPS = [
    { label: "Connecting demo wallet…", duration: 2000 },
    { label: "Filling order form…", duration: 2500 },
    { label: "Encrypting & submitting order…", duration: 3000 },
    { label: "Waiting for price trigger…", duration: 4000 },
    { label: "Order executed! Generating receipt…", duration: 3000 },
    { label: "Opening receipt…", duration: 2000 },
] as const;

const TOTAL_STEPS = DEMO_STEPS.length;

interface JudgeModeProps {
    isActive: boolean;
    onConnectDemo: () => void;
    onPlaceOrder: () => void;
    onSimulateExecution: () => void;
    onOpenReceipt: () => void;
}

const JudgeTooltip = ({
    children,
    tip,
    show,
}: {
    children: React.ReactNode;
    tip: string;
    show: boolean;
}) => {
    if (!show) return <>{children}</>;
    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            {children}
            <span
                style={{
                    position: "absolute",
                    bottom: "calc(100% + 6px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.375rem",
                    background: "hsl(153 100% 50% / 0.15)",
                    border: "1px solid hsl(153 100% 50% / 0.3)",
                    color: "hsl(153 100% 50%)",
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    pointerEvents: "none",
                    zIndex: 100,
                }}
            >
                {tip}
            </span>
        </div>
    );
};

const JudgeMode = ({
    isActive,
    onConnectDemo,
    onPlaceOrder,
    onSimulateExecution,
    onOpenReceipt,
}: JudgeModeProps) => {
    const [step, setStep] = useState(-1); // -1 = not started
    const [paused, setPaused] = useState(false);
    const [showComplete, setShowComplete] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const runStep = useCallback(
        (s: number) => {
            if (s >= TOTAL_STEPS) {
                // Demo complete
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ["#00ff88", "#00cc66", "#ffffff"],
                });
                setShowComplete(true);
                return;
            }

            setStep(s);

            // Execute side effects for each step
            switch (s) {
                case 0:
                    onConnectDemo();
                    break;
                case 1:
                    // Order form auto-populated via isJudge prop
                    break;
                case 2:
                    onPlaceOrder();
                    break;
                case 3:
                    // Simulating price movement
                    break;
                case 4:
                    onSimulateExecution();
                    break;
                case 5:
                    onOpenReceipt();
                    break;
            }
        },
        [onConnectDemo, onPlaceOrder, onSimulateExecution, onOpenReceipt]
    );

    // Auto-advance when not paused
    useEffect(() => {
        if (step < 0 || step >= TOTAL_STEPS || paused) return;

        timerRef.current = setTimeout(() => {
            runStep(step + 1);
        }, DEMO_STEPS[step].duration);

        return clearTimer;
    }, [step, paused, runStep]);

    const startDemo = () => {
        setShowComplete(false);
        setPaused(false);
        runStep(0);
    };

    const skipStep = () => {
        clearTimer();
        if (step + 1 < TOTAL_STEPS) {
            runStep(step + 1);
        } else {
            runStep(TOTAL_STEPS); // triggers completion
        }
    };

    const resetDemo = () => {
        clearTimer();
        setStep(-1);
        setPaused(false);
        setShowComplete(false);
    };

    if (!isActive) return null;

    const progress = step >= 0 ? ((step + 1) / TOTAL_STEPS) * 100 : 0;

    return (
        <>
            {/* Judge Mode badge */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    position: "fixed",
                    top: "1rem",
                    right: "1rem",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px",
                    border: "1px solid hsl(153 100% 50% / 0.3)",
                    background: "hsl(153 100% 50% / 0.08)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "hsl(153 100% 50%)",
                    backdropFilter: "blur(8px)",
                }}
            >
                👨‍⚖️ Judge Mode Active
            </motion.div>

            {/* Floating demo controls */}
            <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                    position: "fixed",
                    bottom: "1.5rem",
                    right: "1.5rem",
                    zIndex: 9999,
                    width: "260px",
                    borderRadius: "0.75rem",
                    border: "1px solid hsl(0 0% 100% / 0.1)",
                    background: "hsl(0 0% 6% / 0.95)",
                    backdropFilter: "blur(12px)",
                    padding: "1rem",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "hsl(153 100% 50%)", letterSpacing: "0.06em" }}>
                        DEMO CONTROLS
                    </span>
                    {step >= 0 && (
                        <span style={{ fontSize: "0.6rem", color: "hsl(0 0% 100% / 0.4)" }}>
                            {step + 1}/{TOTAL_STEPS}
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                {step >= 0 && (
                    <div style={{ width: "100%", height: "3px", borderRadius: "2px", background: "hsl(0 0% 100% / 0.08)", marginBottom: "0.5rem" }}>
                        <motion.div
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                            style={{ height: "100%", borderRadius: "2px", background: "hsl(153 100% 50%)" }}
                        />
                    </div>
                )}

                {/* Current step label */}
                {step >= 0 && step < TOTAL_STEPS && (
                    <p style={{ fontSize: "0.7rem", color: "hsl(0 0% 100% / 0.7)", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                        {DEMO_STEPS[step].label}
                    </p>
                )}

                {/* Buttons */}
                <div style={{ display: "flex", gap: "0.375rem" }}>
                    {step < 0 ? (
                        <Button
                            onClick={startDemo}
                            size="sm"
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8"
                        >
                            <Play className="mr-1 h-3 w-3" /> Run Full Demo
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={() => setPaused(!paused)}
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs h-8 border-border"
                            >
                                {paused ? <Play className="mr-1 h-3 w-3" /> : <Pause className="mr-1 h-3 w-3" />}
                                {paused ? "Resume" : "Pause"}
                            </Button>
                            <Button
                                onClick={skipStep}
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 border-border"
                            >
                                <SkipForward className="h-3 w-3" />
                            </Button>
                            <Button
                                onClick={resetDemo}
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 border-border"
                            >
                                <RotateCcw className="h-3 w-3" />
                            </Button>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Completion modal */}
            <AnimatePresence>
                {showComplete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 99999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0,0,0,0.6)",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                width: "380px",
                                borderRadius: "1rem",
                                border: "1px solid hsl(153 100% 50% / 0.3)",
                                background: "hsl(0 0% 8%)",
                                padding: "2rem",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎉</div>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "hsl(0 0% 98%)", marginBottom: "0.5rem" }}>
                                Demo Complete!
                            </h3>
                            <p style={{ fontSize: "0.85rem", color: "hsl(0 0% 100% / 0.5)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                                You've seen the full encrypted order flow. Want to see the code?
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                    <a href="https://github.com" target="_blank" rel="noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" /> View GitHub
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => { setShowComplete(false); resetDemo(); startDemo(); }}>
                                    <RotateCcw className="mr-2 h-4 w-4" /> Run Again
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-muted-foreground"
                                    onClick={() => {
                                        setShowComplete(false);
                                        resetDemo();
                                        // Remove judge param from URL
                                        const url = new URL(window.location.href);
                                        url.searchParams.delete("judge");
                                        window.history.replaceState({}, "", url.toString());
                                        window.location.reload();
                                    }}
                                >
                                    <X className="mr-2 h-4 w-4" /> Exit Judge Mode
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export { JudgeTooltip };
export default JudgeMode;
