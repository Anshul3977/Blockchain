import { useState, useCallback, useRef, useEffect } from "react";
import Header from "@/components/Header";
import LandingHero from "@/components/LandingHero";
import OrderForm from "@/components/OrderForm";
import OrdersDashboard from "@/components/OrdersDashboard";
import StatsDashboard from "@/components/StatsDashboard";
import MEVComparison from "@/components/MEVComparison";
import TechArchitecture from "@/components/TechArchitecture";
import EncryptedLifecycle from "@/components/EncryptedLifecycle";
import WhyPrivacyMatters from "@/components/WhyPrivacyMatters";
import SafetyGuardrails from "@/components/SafetyGuardrails";
import JudgeMode from "@/components/JudgeMode";
import { useWallet } from "@/hooks/useWallet";
import type { Order } from "@/lib/mockData";

const Index = () => {
  const {
    isConnected,
    shortAddress,
    connecting,
    connect,
    disconnect,
    signer,
    isDemo,
    connectDemo,
    connectReal,
  } = useWallet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Judge Mode detection
  const isJudge =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("judge") === "true";

  const handleOrderPlaced = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const handleCancel = useCallback((id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as const } : o))
    );
  }, []);

  const nextId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 0;

  // Judge Mode: auto-place order
  const orderFormRef = useRef<{ submitDemo: () => void } | null>(null);

  const handleJudgePlaceOrder = useCallback(() => {
    orderFormRef.current?.submitDemo();
  }, []);

  const handleJudgeSimulateExecution = useCallback(() => {
    setOrders((prev) => {
      if (prev.length === 0) return prev;
      const latest = { ...prev[0] };
      latest.status = "executed";
      latest.executionPrice = 0.48;
      latest.savings = 30_000;
      latest.executedAt = new Date().toISOString();
      return [latest, ...prev.slice(1)];
    });
  }, []);

  const handleJudgeOpenReceipt = useCallback(() => {
    setOrders((prev) => {
      if (prev.length > 0) {
        setReceiptOrder(prev[0]);
      }
      return prev;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        isConnected={isConnected}
        shortAddress={shortAddress}
        onConnect={connect}
        onDisconnect={disconnect}
        connecting={connecting}
        isDemo={isDemo}
        onConnectReal={connectReal}
      />

      {!isConnected ? (
        <LandingHero onConnect={connect} connecting={connecting} onDemoConnect={connectDemo} />
      ) : (
        <main className="py-8">
          <OrderForm
            ref={orderFormRef}
            onOrderPlaced={handleOrderPlaced}
            nextId={nextId}
            signer={signer}
            isDemo={isDemo}
            isJudge={isJudge}
            receiptOrder={receiptOrder}
            onCloseReceipt={() => setReceiptOrder(null)}
          />
          <OrdersDashboard localOrders={orders} onCancel={handleCancel} />
          <EncryptedLifecycle />
          <StatsDashboard />
          <WhyPrivacyMatters />
          <MEVComparison />
          <SafetyGuardrails />
          <TechArchitecture />
        </main>
      )}

      <JudgeMode
        isActive={isJudge}
        onConnectDemo={connectDemo}
        onPlaceOrder={handleJudgePlaceOrder}
        onSimulateExecution={handleJudgeSimulateExecution}
        onOpenReceipt={handleJudgeOpenReceipt}
      />
    </div>
  );
};

export default Index;
