const { ethers } = require("ethers");
require("dotenv").config();

// Try to load BITE — it may not be built or available
let BITE;
try {
  BITE = require("@skalenetwork/bite").BITE;
} catch {
  BITE = null;
}

const ORDERBOOK_ADDRESS = "0x894dE66A13414c5F06ec24de238577b3bFEa4EB7";

const orderBookAbi = [
  "function placeOrder(bytes encryptedData) external returns (uint256)",
  "event OrderPlaced(uint256 indexed orderId, address trader)",
];

// ── Configurable order parameters ──
const ORDER = {
  limitPriceCents: 50,    // trigger when price <= $0.50
  amountUSDC: 1_000_000,  // $1,000,000
  slippagePercent: 1,
};

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SKALE_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("=== Place Encrypted Limit Order ===");
  console.log("Wallet:", wallet.address);
  console.log("");

  // Build JSON payload
  const payload = JSON.stringify(ORDER);
  const payloadHex = ethers.hexlify(ethers.toUtf8Bytes(payload));
  let encryptedBytes;
  let usedBITE = false;

  // Attempt BITE encryption if available
  if (BITE) {
    try {
      console.log("Encrypting order data with BITE threshold encryption...");
      const bite = new BITE(process.env.SKALE_RPC);
      const encryptedHex = await bite.encryptMessage(payloadHex);
      encryptedBytes = ethers.getBytes(encryptedHex);
      usedBITE = true;
      console.log("✅ Order data encrypted with BLS public key");
      console.log(`  Encrypted   : ${encryptedHex.slice(0, 40)}...`);
    } catch (biteErr) {
      console.log(`⚠️  BITE encryption unavailable: ${biteErr.message}`);
      console.log("    Falling back to encoded bytes (data visible on-chain)");
      encryptedBytes = ethers.toUtf8Bytes(payload);
    }
  } else {
    console.log("⚠️  @skalenetwork/bite not installed — using encoded bytes");
    encryptedBytes = ethers.toUtf8Bytes(payload);
  }

  console.log("");
  console.log("Order details:");
  console.log(`  Limit Price : $${(ORDER.limitPriceCents / 100).toFixed(2)}`);
  console.log(`  Amount      : $${ORDER.amountUSDC.toLocaleString()}`);
  console.log(`  Slippage    : ${ORDER.slippagePercent}%`);
  console.log(`  Payload     : ${payload}`);
  console.log(`  Encryption  : ${usedBITE ? "BITE ✅" : "Encoded (fallback) ⚠️"}`);
  console.log("");

  const orderBook = new ethers.Contract(ORDERBOOK_ADDRESS, orderBookAbi, wallet);

  console.log("Submitting to OrderBook contract...");
  const tx = await orderBook.placeOrder(encryptedBytes);
  console.log("Tx sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("Confirmed in block:", receipt.blockNumber);

  // Parse OrderPlaced event
  const orderPlacedEvent = receipt.logs.find(
    (log) => log.topics[0] === ethers.id("OrderPlaced(uint256,address)")
  );

  if (orderPlacedEvent) {
    const [orderId] = ethers.AbiCoder.defaultAbiCoder().decode(
      ["uint256"],
      orderPlacedEvent.topics[1]
    );
    console.log(`\n✅ Order #${orderId} placed successfully!`);
    if (usedBITE) {
      console.log("   🔒 Encrypted with BITE threshold encryption");
    } else {
      console.log("   ⚠️  Using encoded bytes (BITE not available on this chain)");
    }
    console.log(`   Explorer: https://aware-fake-trim-testnet.explorer.testnet.skalenodes.com/tx/${receipt.hash}`);
  } else {
    console.log("\n✅ Order placed! Check explorer for details.");
  }
}

main().catch(console.error);