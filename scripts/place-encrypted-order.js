const { ethers } = require("ethers");
require("dotenv").config();

const ORDERBOOK_ADDRESS = "0x894dE66A13414c5F06ec24de238577b3bFEa4EB7";

const orderBookAbi = [
  "function placeOrder(bytes encryptedData) external returns (uint256)",
  "event OrderPlaced(uint256 indexed orderId, address trader)",
];

// ── Configurable order parameters ──
const ORDER = {
  limitPriceCents: 30,    // trigger when price <= $0.30
  amountUSDC: 1_000_000,  // $1,000,000
  slippagePercent: 1,
};

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SKALE_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("=== Place Encrypted Limit Order ===");
  console.log("Wallet:", wallet.address);
  console.log("");

  // Build JSON payload (simulates what BITE v2 would encrypt)
  const payload = JSON.stringify(ORDER);
  const encryptedBytes = ethers.toUtf8Bytes(payload);

  console.log("Order details:");
  console.log(`  Limit Price : $${(ORDER.limitPriceCents / 100).toFixed(2)}`);
  console.log(`  Amount      : $${ORDER.amountUSDC.toLocaleString()}`);
  console.log(`  Slippage    : ${ORDER.slippagePercent}%`);
  console.log(`  Payload     : ${payload}`);
  console.log(`  Bytes (hex) : ${ethers.hexlify(encryptedBytes).slice(0, 40)}...`);
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
    console.log(`   Explorer: https://aware-fake-trim-testnet.explorer.testnet.skalenodes.com/tx/${receipt.hash}`);
  } else {
    console.log("\n✅ Order placed! Check explorer for details.");
  }
}

main().catch(console.error);