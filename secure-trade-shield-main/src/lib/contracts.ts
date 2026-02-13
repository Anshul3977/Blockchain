import { ethers } from "ethers";

// --- Contract ABIs ---

export const ORDERBOOK_ABI = [
  "function placeOrder(bytes encryptedData) external returns (uint256)",
  "function orders(uint256) external view returns (bytes encryptedData, address trader, uint256 timestamp, bool executed)",
  "function orderCount() external view returns (uint256)",
  "event OrderPlaced(uint256 indexed orderId, address trader)",
];

export const ORACLE_ABI = [
  "function price() external view returns (uint256)",
];

export const DEX_ABI = [
  "function swap(uint256 amountIn, bool aToB) external",
  "function currentPrice() external view returns (uint256)",
];

export const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
];

// --- Contract addresses from environment ---

export const CONTRACTS = {
  orderBook: import.meta.env.VITE_ORDERBOOK_ADDRESS as string,
  oracle: import.meta.env.VITE_ORACLE_ADDRESS as string,
  dex: import.meta.env.VITE_DEX_ADDRESS as string,
  usdc: "0x96115a4D71E4B420d20485010f42a3EC0F295122",
};

export const SKALE_EXPLORER = "https://aware-fake-trim-testnet.explorer.testnet.skalenodes.com";

// --- SKALE network configuration ---

export const SKALE_NETWORK = {
  chainId: `0x${Number(import.meta.env.VITE_CHAIN_ID).toString(16)}`,
  chainName: "SKALE Testnet",
  rpcUrls: [import.meta.env.VITE_SKALE_RPC as string],
  nativeCurrency: {
    name: "sFUEL",
    symbol: "sFUEL",
    decimals: 18,
  },
  blockExplorerUrls: [
    "https://aware-fake-trim-testnet.explorer.testnet.skalenodes.com",
  ],
};

// --- Helper: get contract instances ---

export function getContracts(signerOrProvider: ethers.Signer | ethers.Provider) {
  return {
    orderBook: new ethers.Contract(CONTRACTS.orderBook, ORDERBOOK_ABI, signerOrProvider),
    oracle: new ethers.Contract(CONTRACTS.oracle, ORACLE_ABI, signerOrProvider),
    dex: new ethers.Contract(CONTRACTS.dex, DEX_ABI, signerOrProvider),
  };
}

// --- Helper: switch MetaMask to SKALE network ---

export async function switchToSKALE(): Promise<void> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SKALE_NETWORK.chainId }],
    });
  } catch (switchError: unknown) {
    // Error code 4902 means the chain has not been added to MetaMask
    if (
      typeof switchError === "object" &&
      switchError !== null &&
      "code" in switchError &&
      (switchError as { code: number }).code === 4902
    ) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SKALE_NETWORK],
      });
    } else {
      throw switchError;
    }
  }
}
