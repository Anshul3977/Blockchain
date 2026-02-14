import { motion, type Variants } from "framer-motion";
import {
    ShieldCheck,
    Gauge,
    Timer,
    UserCheck,
    AlertTriangle,
    Pause,
    RefreshCw,
    Ban,
} from "lucide-react";

const guardrails = [
    {
        icon: Gauge,
        title: "Size Limits",
        color: "153 100% 50%",
        items: [
            { label: "Max order", value: "$5,000,000" },
            { label: "Min order", value: "$1,000" },
            { label: "Purpose", value: "Prevents whale manipulation" },
        ],
    },
    {
        icon: ShieldCheck,
        title: "Price Protection",
        color: "200 100% 60%",
        items: [
            { label: "Slippage range", value: "0.5% – 5%" },
            { label: "Oracle source", value: "Chainlink verified" },
            { label: "Staleness check", value: "60s maximum" },
        ],
    },
    {
        icon: Timer,
        title: "Time Limits",
        color: "45 100% 55%",
        items: [
            { label: "Max wait", value: "24 hours" },
            { label: "Auto-cancel", value: "If not filled" },
            { label: "Timeout action", value: "Full refund" },
        ],
    },
    {
        icon: UserCheck,
        title: "Access Control",
        color: "280 80% 65%",
        items: [
            { label: "Oracle access", value: "Allowlist-only" },
            { label: "Rate limiting", value: "10 orders/hour" },
            { label: "Emergency", value: "Pause available" },
        ],
    },
];

const bottomBadges = [
    { icon: AlertTriangle, text: "Anomaly Detection" },
    { icon: Pause, text: "Emergency Pause" },
    { icon: RefreshCw, text: "Auto-Recovery" },
    { icon: Ban, text: "Rate Limiting" },
];

const cardVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4 },
    }),
};

const SafetyGuardrails = () => {
    return (
        <div className="mx-auto w-full max-w-[1100px] px-4 py-16">
            {/* Header */}
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
                    Trust &amp; Safety
                </p>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl mb-2">
                    🛡️ Built-in Safety Guardrails
                </h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                    Our encrypted agent operates within strict safety parameters —
                    protecting traders from both external threats and edge cases.
                </p>
            </motion.div>

            {/* Four guardrail cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {guardrails.map((rail, i) => (
                    <motion.div
                        key={rail.title}
                        custom={i}
                        variants={cardVariant}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-30px" }}
                        className="rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(180deg, hsl(${rail.color} / 0.06), hsl(${rail.color} / 0.02))`,
                            border: `1px solid hsl(${rail.color} / 0.18)`,
                        }}
                    >
                        {/* Icon + Title */}
                        <div className="flex items-center gap-2.5 mb-4">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{
                                    background: `hsl(${rail.color} / 0.12)`,
                                    border: `1px solid hsl(${rail.color} / 0.25)`,
                                }}
                            >
                                <rail.icon
                                    className="h-5 w-5"
                                    style={{ color: `hsl(${rail.color})` }}
                                />
                            </div>
                            <h3
                                className="text-sm font-bold"
                                style={{ color: `hsl(${rail.color})` }}
                            >
                                {rail.title}
                            </h3>
                        </div>

                        {/* Items */}
                        <div className="space-y-2.5">
                            {rail.items.map((item) => (
                                <div key={item.label}>
                                    <p className="text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground mb-0.5">
                                        {item.label}
                                    </p>
                                    <p className="text-xs font-semibold text-foreground">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom badges */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
                {bottomBadges.map((badge) => (
                    <div
                        key={badge.text}
                        className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
                        style={{
                            border: "1px solid hsl(0 0% 100% / 0.1)",
                            background: "hsl(0 0% 100% / 0.03)",
                        }}
                    >
                        <badge.icon
                            className="h-3 w-3"
                            style={{ color: "hsl(153 100% 50% / 0.6)" }}
                        />
                        <span
                            className="text-[0.65rem] font-semibold"
                            style={{ color: "hsl(0 0% 100% / 0.5)" }}
                        >
                            {badge.text}
                        </span>
                    </div>
                ))}
            </motion.div>

            {/* Audit note */}
            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="mt-5 text-center text-[0.65rem] text-muted-foreground"
            >
                All guardrails are enforced at the smart contract level — not just the
                UI. Verified on{" "}
                <a
                    href="https://aware-fake-trim-testnet.explorer.testnet.skalenodes.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-foreground"
                >
                    SKALE Block Explorer
                </a>
                .
            </motion.p>
        </div>
    );
};

export default SafetyGuardrails;
