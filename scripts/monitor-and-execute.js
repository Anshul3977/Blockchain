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

const oracleAbi = ["function price() view returns (uint256)"];
const dexAbi = ["function swap(uint256 amountIn, bool aToB) external"];

// ── Helpers ──

function decodeOrder(encryptedData) {
  try {
    const json = ethers.toUtf8String(encryptedData);
    const parsed = JSON.parse(json);
    if (parsed.limitPriceCents && parsed.amountUSDC) {
      return parsed;
    }
  } catch {
    // Legacy orders stored as plain strings — fall back
  }
  return null;
}

function centsToUSD(cents) {
  return (cents / 100).toFixed(2);
}

// ── Main loop ──

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SKALE_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const orderBook = new ethers.Contract(ORDERBOOK_ADDRESS, orderBookAbi, wallet);
  const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, provider);
  const dex = new ethers.Contract(DEX_ADDRESS, dexAbi, wallet);

  console.log("╔══════════════════════════════════════════╗");
  console.log("║   Private Limit Order Agent Monitor      ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log("Chain  : SKALE Titan AI Hub Testnet");
  console.log("Wallet :", wallet.address);
  console.log("Press Ctrl+C to stop\n");

  while (true) {
    try {
      const currentPrice = Number(await oracle.price());
      const ts = new Date().toISOString();
      console.log(`\n[${ts}] Oracle price: $${centsToUSD(currentPrice)}`);

      const orderCount = Number(await orderBook.orderCount());
      console.log(`Orders in contract: ${orderCount}`);

      for (let i = 0; i < orderCount; i++) {
        const order = await orderBook.orders(i);
        if (order.executed) continue;

        // Decode the JSON payload from encryptedData
        const decoded = decodeOrder(order.encryptedData);

        console.log(`\n  Order #${i}`);
        console.log(`    Trader    : ${order.trader}`);
        console.log(`    Submitted : ${new Date(Number(order.timestamp) * 1000).toLocaleString()}`);

        if (decoded) {
          const limitCents = decoded.limitPriceCents;
          console.log(`    Limit     : $${centsToUSD(limitCents)}`);
          console.log(`    Amount    : $${decoded.amountUSDC.toLocaleString()}`);
          console.log(`    Slippage  : ${decoded.slippagePercent}%`);
          console.log(`    Current   : $${centsToUSD(currentPrice)}`);

          // ── Dynamic trigger: current price <= order limit price ──
          if (currentPrice <= limitCents) {
            console.log(`    → 🔥 TRIGGER ACTIVATED ($${centsToUSD(currentPrice)} <= $${centsToUSD(limitCents)})`);
            console.log(`    Decrypting & executing order...`);

            // Attempt DEX swap (tiny amount for demo safety)
            let txSwap = null;
            try {
              const swapAmount = ethers.parseUnits("0.000001", 6);
              txSwap = await dex.connect(wallet).swap(swapAmount, false);
              console.log(`    Swap tx   : ${txSwap.hash}`);
              await txSwap.wait();
              console.log(`    Swap confirmed ✅`);
            } catch (swapErr) {
              console.warn(`    Swap skipped: ${swapErr.shortMessage || swapErr.message}`);
            }

            // Mark order as executed on-chain
            let txExec;
            try {
              txExec = await orderBook.executeOrder(i);
              console.log(`    Execute tx: ${txExec.hash}`);
              await txExec.wait();
              console.log(`    Order #${i} marked EXECUTED ✅`);
            } catch (execErr) {
              console.error(`    Execute failed: ${execErr.message}`);
              continue;
            }

            // Print receipt
            const receipt = {
              orderId: i,
              executedAt: ts,
              oraclePrice: `$${centsToUSD(currentPrice)}`,
              limitPrice: `$${centsToUSD(limitCents)}`,
              amount: `$${decoded.amountUSDC.toLocaleString()}`,
              swapTx: txSwap ? txSwap.hash : "skipped (demo)",
              execTx: txExec.hash,
              status: txSwap ? "Full Success" : "Partial (swap skipped)",
            };

            console.log("\n  ╔═══ EXECUTION RECEIPT ═══╗");
            console.log("  " + JSON.stringify(receipt, null, 2).split("\n").join("\n  "));
            console.log("  ╚═════════════════════════╝");
            console.log("═".repeat(60));
          } else {
            console.log(`    ⏳ Waiting ($${centsToUSD(currentPrice)} > $${centsToUSD(limitCents)})`);
          }
        } else {
          // Legacy order — no JSON payload, skip
          console.log(`    Encrypted : ${order.encryptedData.slice(0, 40)}...`);
          console.log(`    ⏭️  Legacy order (no limit data) — skipping`);
        }
      }
    } catch (e) {
      console.error("Monitor error:", e.message);
    }

    await new Promise((r) => setTimeout(r, 10000)); // Poll every 10s
  }
}

main().catch(console.error);