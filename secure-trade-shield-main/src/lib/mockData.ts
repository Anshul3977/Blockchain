export interface Order {
  id: number;
  amount: number;
  limitPrice: number;
  slippage: number;
  status: "waiting" | "executed" | "cancelled";
  executionPrice?: number;
  savings?: number;
  submittedAt: string;
  executedAt?: string;
  txHash?: string;
  isDemo?: boolean;
}

export const MOCK_CURRENT_PRICE = 0.65;
export const MOCK_BALANCE = 2_500_000;

export const MOCK_ORDERS: Order[] = [
  {
    id: 0,
    amount: 1_000_000,
    limitPrice: 0.5,
    slippage: 1,
    status: "waiting",
    submittedAt: "2026-02-11T10:23:45Z",
  },
  {
    id: 1,
    amount: 500_000,
    limitPrice: 0.5,
    slippage: 1,
    status: "executed",
    executionPrice: 0.48,
    savings: 30_000,
    submittedAt: "2026-02-10T08:15:00Z",
    executedAt: "2026-02-10T14:15:22Z",
    txHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: 2,
    amount: 250_000,
    limitPrice: 0.55,
    slippage: 2,
    status: "cancelled",
    submittedAt: "2026-02-09T12:00:00Z",
  },
];
