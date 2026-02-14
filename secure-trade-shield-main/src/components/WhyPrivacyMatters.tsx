import { motion } from "framer-motion";
import {
    Eye,
    EyeOff,
    Bot,
    ShieldOff,
    TrendingUp,
    DollarSign,
    ShieldCheck,
    Lock,
    Ban,
    CircleCheck,
    Frown,
    PartyPopper,
} from "lucide-react";

const publicVisibleItems = [
    { icon: DollarSign, label: "Order amount", value: "$1,000,000" },
    { icon: TrendingUp, label: "Limit price", value: "$0.50" },
    { icon: Eye, label: "Trader wallet", value: "0xABC...DEF" },
    { icon: ShieldOff, label: "Slippage", value: "1%" },
];

const publicBotSteps = [
    "Detects large order in mempool",
    "Front-runs with higher gas priority",
    "Buys tokens first, drives price up",
    "You pay inflated price: $0.51",
];

const encryptedVisibleItems = [
    { label: "Encrypted data", value: "████████████" },
    { label: "Unknown amount", value: "████████████" },
    { label: "Unknown price", value: "████████████" },
    { label: "Unknown trader", value: "████████████" },
];

const encryptedBotSteps = [
    "Sees encrypted blob on-chain",
    "Cannot decode trading strategy",
    "Cannot front-run order",
    "Order executes privately at fair price",
];

const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const WhyPrivacyMatters = () => {
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
                    Why Privacy Matters
                </p>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl mb-2">
                    Your Strategy, Your Advantage
                </h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                    See exactly how MEV front-running steals from public orders — and how
                    BITE v2 encryption stops it.
                </p>
            </motion.div>

            {/* Split comparison */}
            <div className="grid gap-5 sm:grid-cols-2">
                {/* ─── LEFT: Public Order ─── */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                        border: "1px solid hsl(0 60% 45% / 0.3)",
                        background:
                            "linear-gradient(180deg, hsl(0 60% 45% / 0.06), hsl(0 60% 45% / 0.02))",
                    }}
                >
                    {/* Header bar */}
                    <div
                        className="px-5 py-3 flex items-center gap-2"
                        style={{
                            background: "hsl(0 60% 45% / 0.12)",
                            borderBottom: "1px solid hsl(0 60% 45% / 0.15)",
                        }}
                    >
                        <Eye
                            className="h-4 w-4"
                            style={{ color: "hsl(0 70% 60%)" }}
                        />
                        <span
                            className="text-sm font-bold"
                            style={{ color: "hsl(0 70% 60%)" }}
                        >
                            Public Order ❌
                        </span>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* What bot sees */}
                        <div>
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
                                👁️ MEV Bot Sees Everything
                            </p>
                            <div className="space-y-2">
                                {publicVisibleItems.map((item) => (
                                    <motion.div
                                        key={item.label}
                                        variants={fadeUp}
                                        className="flex items-center justify-between rounded-lg px-3 py-2"
                                        style={{
                                            background: "hsl(0 0% 100% / 0.03)",
                                            border: "1px solid hsl(0 0% 100% / 0.06)",
                                        }}
                                    >
                                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <item.icon className="h-3 w-3" />
                                            {item.label}
                                        </span>
                                        <span
                                            className="font-mono text-xs font-semibold"
                                            style={{ color: "hsl(0 70% 60%)" }}
                                        >
                                            {item.value}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Bot action */}
                        <div>
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
                                🤖 Bot Action
                            </p>
                            <div className="space-y-1.5">
                                {publicBotSteps.map((step, i) => (
                                    <motion.div
                                        key={step}
                                        variants={fadeUp}
                                        className="flex items-start gap-2 text-xs"
                                    >
                                        <span
                                            className="shrink-0 mt-0.5 font-mono font-bold text-[0.65rem]"
                                            style={{ color: "hsl(0 70% 60%)" }}
                                        >
                                            {i + 1}.
                                        </span>
                                        <span style={{ color: "hsl(0 0% 100% / 0.65)" }}>
                                            {step}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Result */}
                        <motion.div
                            variants={fadeUp}
                            className="rounded-xl p-4 text-center"
                            style={{
                                background: "hsl(0 60% 45% / 0.1)",
                                border: "1px solid hsl(0 60% 45% / 0.2)",
                            }}
                        >
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Frown
                                    className="h-4 w-4"
                                    style={{ color: "hsl(0 70% 60%)" }}
                                />
                                <span className="text-xs text-muted-foreground">
                                    Your Cost
                                </span>
                            </div>
                            <p
                                className="font-mono text-2xl font-bold"
                                style={{ color: "hsl(0 70% 60%)" }}
                            >
                                $510,000
                            </p>
                            <p className="text-xs mt-1" style={{ color: "hsl(0 70% 60% / 0.7)" }}>
                                $30,000 stolen by MEV bot
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ─── RIGHT: Encrypted Order ─── */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                        border: "1px solid hsl(153 100% 50% / 0.3)",
                        background:
                            "linear-gradient(180deg, hsl(153 100% 50% / 0.06), hsl(153 100% 50% / 0.02))",
                    }}
                >
                    {/* Header bar */}
                    <div
                        className="px-5 py-3 flex items-center gap-2"
                        style={{
                            background: "hsl(153 100% 50% / 0.12)",
                            borderBottom: "1px solid hsl(153 100% 50% / 0.15)",
                        }}
                    >
                        <Lock
                            className="h-4 w-4"
                            style={{ color: "hsl(153 100% 50%)" }}
                        />
                        <span
                            className="text-sm font-bold"
                            style={{ color: "hsl(153 100% 50%)" }}
                        >
                            Encrypted Order ✅
                        </span>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* What bot sees */}
                        <div>
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
                                🔒 MEV Bot Sees
                            </p>
                            <div className="space-y-2">
                                {encryptedVisibleItems.map((item) => (
                                    <motion.div
                                        key={item.label}
                                        variants={fadeUp}
                                        className="flex items-center justify-between rounded-lg px-3 py-2"
                                        style={{
                                            background: "hsl(0 0% 100% / 0.03)",
                                            border: "1px solid hsl(0 0% 100% / 0.06)",
                                        }}
                                    >
                                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <EyeOff className="h-3 w-3" />
                                            {item.label}
                                        </span>
                                        <span
                                            className="font-mono text-xs font-semibold"
                                            style={{
                                                color: "hsl(153 100% 50% / 0.5)",
                                                letterSpacing: "0.08em",
                                            }}
                                        >
                                            {item.value}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Bot action */}
                        <div>
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
                                🤷 Bot Action
                            </p>
                            <div className="space-y-1.5">
                                {encryptedBotSteps.map((step, i) => (
                                    <motion.div
                                        key={step}
                                        variants={fadeUp}
                                        className="flex items-start gap-2 text-xs"
                                    >
                                        <span
                                            className="shrink-0 mt-0.5 font-mono font-bold text-[0.65rem]"
                                            style={{ color: "hsl(153 100% 50%)" }}
                                        >
                                            {i + 1}.
                                        </span>
                                        <span style={{ color: "hsl(0 0% 100% / 0.65)" }}>
                                            {step}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Result */}
                        <motion.div
                            variants={fadeUp}
                            className="rounded-xl p-4 text-center"
                            style={{
                                background: "hsl(153 100% 50% / 0.08)",
                                border: "1px solid hsl(153 100% 50% / 0.2)",
                            }}
                        >
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <PartyPopper
                                    className="h-4 w-4"
                                    style={{ color: "hsl(153 100% 50%)" }}
                                />
                                <span className="text-xs text-muted-foreground">
                                    Your Cost
                                </span>
                            </div>
                            <p
                                className="font-mono text-2xl font-bold"
                                style={{ color: "hsl(153 100% 50%)" }}
                            >
                                $480,000
                            </p>
                            <p
                                className="text-xs mt-1"
                                style={{ color: "hsl(153 100% 50% / 0.7)" }}
                            >
                                $30,000 saved with encryption 🎉
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom savings callout */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-6 mx-auto max-w-md rounded-xl p-4 text-center"
                style={{
                    background:
                        "linear-gradient(135deg, hsl(153 100% 50% / 0.08), hsl(153 100% 50% / 0.03))",
                    border: "1px solid hsl(153 100% 50% / 0.25)",
                    boxShadow: "0 4px 30px hsl(153 100% 50% / 0.08)",
                }}
            >
                <p className="text-sm font-semibold text-foreground mb-0.5">
                    Net Savings Per Trade
                </p>
                <p
                    className="font-mono text-3xl font-extrabold"
                    style={{ color: "hsl(153 100% 50%)" }}
                >
                    $30,000
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    6% less cost on a $1M trade • Protected by BITE v2 encryption
                </p>
            </motion.div>
        </div>
    );
};

export default WhyPrivacyMatters;
