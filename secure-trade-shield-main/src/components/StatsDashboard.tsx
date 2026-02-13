import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { Lock, Shield, TrendingUp } from "lucide-react";

interface StatCardProps {
    icon: React.ElementType;
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
    highlight?: boolean;
    delay?: number;
}

const StatCard = ({ icon: Icon, value, prefix = "", suffix = "", label, highlight = false, delay = 0 }: StatCardProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    const count = useMotionValue(0);

    const display = useTransform(count, (v) => {
        const n = Math.round(v);
        if (suffix === "M") {
            return `${prefix}${(n / 10).toFixed(1)}${suffix}`;
        }
        return `${prefix}${n.toLocaleString("en-US")}`;
    });

    useEffect(() => {
        if (isInView) {
            const target = suffix === "M" ? value * 10 : value;
            animate(count, target, { duration: 1.8, ease: "easeOut", delay });
        }
    }, [isInView, count, value, suffix, delay]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="stats-card"
            style={{
                padding: "1.5rem",
                borderRadius: "0.75rem",
                border: highlight ? "1px solid hsl(153 100% 50% / 0.4)" : "1px solid hsl(0 0% 100% / 0.08)",
                background: "hsl(0 0% 100% / 0.02)",
                textAlign: "center",
                cursor: "default",
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px hsl(153 100% 50% / 0.08), 0 0 60px hsl(153 100% 50% / 0.04)";
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(153 100% 50% / 0.3)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.borderColor = highlight ? "hsl(153 100% 50% / 0.4)" : "hsl(0 0% 100% / 0.08)";
            }}
        >
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "0.625rem",
                    background: highlight ? "hsl(153 100% 50% / 0.12)" : "hsl(0 0% 100% / 0.05)",
                    marginBottom: "0.75rem",
                }}
            >
                <Icon
                    style={{
                        width: "1.25rem",
                        height: "1.25rem",
                        color: highlight ? "hsl(153 100% 50%)" : "hsl(153 100% 50% / 0.7)",
                    }}
                />
            </div>

            <motion.div
                style={{
                    fontSize: highlight ? "2.25rem" : "2rem",
                    fontWeight: 800,
                    fontFamily: "monospace",
                    color: highlight ? "hsl(153 100% 50%)" : "hsl(0 0% 98%)",
                    lineHeight: 1.1,
                }}
            >
                {display}
            </motion.div>

            <p
                style={{
                    marginTop: "0.375rem",
                    fontSize: "0.75rem",
                    color: "hsl(0 0% 100% / 0.45)",
                    letterSpacing: "0.025em",
                }}
            >
                {label}
            </p>
        </motion.div>
    );
};

const StatsDashboard = () => {
    return (
        <div
            style={{
                maxWidth: "600px",
                margin: "0 auto",
                padding: "2rem 1rem",
            }}
        >
            <h2
                style={{
                    textAlign: "center",
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: "hsl(0 0% 98%)",
                    marginBottom: "1.25rem",
                }}
            >
                Platform Impact
            </h2>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.75rem",
                }}
                className="stats-grid"
            >
                <StatCard icon={Lock} value={4} label="Encrypted limit orders" delay={0} />
                <StatCard icon={Shield} value={2.5} suffix="M" prefix="$" label="Trading volume secured" delay={0.15} />
                <StatCard icon={TrendingUp} value={50000} prefix="$" label="Saved from front-running" highlight delay={0.3} />
            </div>

            <style>{`
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
};

export default StatsDashboard;
