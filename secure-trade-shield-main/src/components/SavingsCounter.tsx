import { useEffect, useRef } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    animate,
    useInView,
} from "framer-motion";

const SavingsCounter = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    const count = useMotionValue(0);
    const rounded = useTransform(count, (v) => {
        const n = Math.round(v);
        return `$${n.toLocaleString("en-US")}`;
    });

    useEffect(() => {
        if (isInView) {
            animate(count, 30000, { duration: 2, ease: "easeOut" });
        }
    }, [isInView, count]);

    return (
        <div
            ref={ref}
            className="savings-counter-wrapper"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: "3rem",
                paddingBottom: "3rem",
                borderRadius: "1rem",
                background:
                    "radial-gradient(ellipse at center, rgba(0,255,136,0.05) 0%, transparent 70%)",
                marginTop: "2rem",
            }}
        >
            {/* Main counter */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="savings-counter-glow"
                style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "1rem 2rem",
                    borderRadius: "1rem",
                }}
            >
                <span
                    style={{
                        fontSize: "3.75rem",
                        fontWeight: 800,
                        color: "#00ff88",
                        fontFamily: "monospace",
                        lineHeight: 1,
                    }}
                >
                    You Saved:{" "}
                </span>
                <motion.span
                    className="savings-number-shine"
                    style={{
                        fontSize: "3.75rem",
                        fontWeight: 800,
                        color: "#00ff88",
                        fontFamily: "monospace",
                        lineHeight: 1,
                        position: "relative",
                        display: "inline-block",
                        overflow: "hidden",
                    }}
                >
                    {rounded}
                </motion.span>
            </motion.div>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 2.1, duration: 0.5 }}
                style={{
                    marginTop: "1rem",
                    fontSize: "0.875rem",
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.025em",
                }}
            >
                vs. Public DEX Order &bull; 5.9% Slippage Prevented
            </motion.p>

            {/* Inline styles for glow pulse + shine keyframes */}
            <style>{`
        .savings-counter-glow {
          box-shadow: 0 0 40px rgba(0,255,136,0.15), 0 0 80px rgba(0,255,136,0.08);
          animation: glowPulse 2.5s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(0,255,136,0.15), 0 0 80px rgba(0,255,136,0.08); }
          50%       { box-shadow: 0 0 60px rgba(0,255,136,0.30), 0 0 120px rgba(0,255,136,0.15); }
        }

        .savings-number-shine::after {
          content: "";
          position: absolute;
          top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255,255,255,0.25) 50%,
            transparent 100%
          );
          animation: shine 3s ease-in-out infinite;
        }
        @keyframes shine {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
        </div>
    );
};

export default SavingsCounter;
