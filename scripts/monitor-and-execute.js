const { ethers } = require("ethers");
require("dotenv").config();

const ORDERBOOK_ADDRESS = "0x894dE66A13414c5F06ec24de238577b3bFEa4EB7";
const ORACLE_ADDRESS = "0x503a2A1739B1cEB4067916bA9e26E25494BF9f43";
const DEX_ADDRESS = "0xB032862C9f9bd904Df674e8ee5fd72ac81dbf0A0";

const orderBookAbi = [
  "function orders(uint256) view returns (bytes encryptedData, address trader, uint256 timestamp, bool executed)",
  "function orderCount() view returns (uint256)",
  "function executeOrder(uint256 orderId) external",
];

const oracleAbi = [
  "function price() view returns (uint256)",
];

const dexAbi = [
  "function swap(uint256 amountIn, bool aToB) external",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SKALE_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const orderBook = new ethers.Contract(ORDERBOOK_ADDRESS, orderBookAbi, wallet);
  const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, provider);
  const dex = new ethers.Contract(DEX_ADDRESS, dexAbi, wallet);

  console.log("=== Private Limit Order Agent Monitor ===");
  console.log("Chain: SKALE Titan AI Hub Testnet");
  console.log("Wallet:", wallet.address);
  console.log("Press Ctrl+C to stop");

  while (true) {
    try {
      const currentPrice = Number(await oracle.price());
      const timestamp = new Date().toISOString();
      console.log(`\n[Poll ${timestamp}] Price: ${currentPrice / 100} USDC`);

      const orderCount = Number(await orderBook.orderCount());
      console.log(`Active orders in contract: ${orderCount}`);

      for (let i = 0; i < orderCount; i++) {
        const order = await orderBook.orders(i);
        if (order.executed) continue;

        console.log(`\nOrder #${i}`);
        console.log(`  Trader: ${order.trader}`);
        console.log(`  Submitted: ${new Date(Number(order.timestamp) * 1000).toLocaleString()}`);
        console.log(`  Encrypted: ${order.encryptedData.slice(0, 66)}...`);

        // Mock trigger condition (real: BITE decrypt would check price threshold)
        const triggerPrice = 60;
        if (currentPrice < triggerPrice) {
          console.log(`  → Trigger activated (price ${currentPrice / 100} < ${triggerPrice / 100})`);

          // Mock decrypted data (small amount to prevent DEX overflow)
          const mockData = {
            action: "BUY",
            amount: ethers.parseUnits("0.000001", 6), // 0.000001 USDC - tiny for demo
            slippagePercent: 1,
          };

          console.log("  Mock decrypted:", mockData);

          let txSwap = null;
          try {
            const amountIn = mockData.amount;
            txSwap = await dex.connect(wallet).swap(amountIn, false);
            console.log("  Swap tx:", txSwap.hash);
            await txSwap.wait();
            console.log("  Swap confirmed");
          } catch (swapError) {
            console.warn("  Swap skipped (demo overflow):", swapError.shortMessage || swapError.message);
          }

          let txExec;
          try {
            txExec = await orderBook.executeOrder(i);
            console.log("  Execute tx:", txExec.hash);
            await txExec.wait();
            console.log("  Order marked executed");
          } catch (execError) {
            console.error("  Execute failed:", execError.message);
            continue;
          }

          // Receipt
          const receipt = {
            orderId: i.toString(),
            executedAt: timestamp,
            triggerPriceUSDC: currentPrice / 100,
            attemptedAmountUSDC: ethers.formatUnits(mockData.amount, 6),
            swapTx: txSwap ? txSwap.hash : "skipped (demo)",
            execTx: txExec.hash,
            status: txSwap ? "Full Success" : "Partial Success (swap demo skipped)",
            note: "Mock trigger & execution. Real BITE decryption pending."
          };

          console.log("\nRECEIPT:");
          console.log(JSON.stringify(receipt, null, 2));
          console.log("=".repeat(60));
        } else {
          console.log(`  Waiting (price ${currentPrice / 100} >= ${triggerPrice / 100})`);
        }
      }
    } catch (e) {
      console.error("Monitor error:", e.message);
    }

    await new Promise(r => setTimeout(r, 10000)); // Poll 10s
  }
}

main().catch(console.error);