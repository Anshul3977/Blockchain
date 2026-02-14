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

function decodeOrder(encryptedDataHex) {
  // NOTE: BITE decryption requires the placement tx hash via
  // bite.getDecryptedTransactionData(txHash). Since orders don't store
  // their tx hash, we decode inline. When BITE is fully integrated,
  // store tx hashes alongside orders and use getDecryptedTransactionData.
  try {
    const json = ethers.toUtf8String(encryptedDataHex);
    const parsed = JSON.parse(json);
    console.log(`    ✅ Decoded order data`);
    return parsed;
  } catch (e) {
    console.log(`    ❌ Decode failed: ${e.message}`);
    return null;
  }
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
      console.log(`\n[${ts}] Oracle price: $${centsToUSD(currentPrice)} (${currentPrice} cents)`);

      const orderCount = Number(await orderBook.orderCount());
      console.log(`Orders in contract: ${orderCount}`);

      for (let i = 0; i < orderCount; i++) {
        console.log(`\n  --- Processing Order #${i} ---`);
        const order = await orderBook.orders(i);

        // 1. Show raw encrypted bytes
        console.log(`  Raw Bytes: ${order.encryptedData.slice(0, 40)}...`);
        console.log(`  Executed : ${order.executed}`);

        if (order.executed) {
          console.log(`  Skipping (Already Executed)`);
          continue;
        }

        // 2. Decode order data
        const decoded = decodeOrder(order.encryptedData);

        if (!decoded) {
          console.log(`  Skipping: Could not decode order data`);
          continue;
        }

        console.log(`  Payload  :`, JSON.stringify(decoded));

        // Support both frontend format (limitPrice in dollars) and script format (limitPriceCents)
        const limitCents = decoded.limitPriceCents ?? Math.round((decoded.limitPrice ?? 0) * 100);

        if (!limitCents) {
          console.log(`  Skipping: Missing limit price in payload`);
          continue;
        }

        // 3. Trigger Logic
        const currentPriceCents = currentPrice;

        console.log(`  Current Price : $${centsToUSD(currentPriceCents)} (${currentPriceCents})`);
        console.log(`  Limit Price   : $${centsToUSD(limitCents)} (${limitCents})`);

        const shouldExecute = currentPriceCents <= limitCents;
        console.log(`  Comparison    : ${currentPriceCents} <= ${limitCents} = ${shouldExecute}`);

        if (shouldExecute) {
          console.log(`  >>> EXECUTING ORDER #${i} <<<`);

          // Attempt DEX swap (tiny amount for demo safety)
          try {
            const swapAmount = ethers.parseUnits("0.000001", 6);
            console.log(`    Swapping...`);
            const txSwap = await dex.swap(swapAmount, false);
            await txSwap.wait();
            console.log(`    Swap Confirmed: ${txSwap.hash}`);
          } catch (swapErr) {
            console.log(`    Swap Skipped: ${swapErr.message}`);
          }

          // Execute on OrderBook
          try {
            console.log(`    Calling executeOrder(${i})...`);
            const txExec = await orderBook.executeOrder(i);
            console.log(`    Tx Sent: ${txExec.hash}`);
            const receipt = await txExec.wait();
            console.log(`    ✅ Order #${i} EXECUTED in block ${receipt.blockNumber}`);
          } catch (execErr) {
            console.error(`    ❌ Execution Failed: ${execErr.message}`);
          }
        } else {
          console.log(`  Status        : Waiting...`);
        }
      }

    } catch (e) {
      console.error("Monitor error:", e.message);
    }

    await new Promise((r) => setTimeout(r, 10000)); // Poll every 10s
  }
}

main().catch(console.error);