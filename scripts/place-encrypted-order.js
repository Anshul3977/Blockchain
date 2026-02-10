const { ethers } = require("ethers");
require("dotenv").config();

const ORDERBOOK_ADDRESS = "0x894dE66A13414c5F06ec24de238577b3bFEa4EB7";

const orderBookAbi = [
  "function placeOrder(bytes encryptedData) external returns (uint256)",
  "event OrderPlaced(uint256 indexed orderId, address trader)",
];

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SKALE_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Wallet connected:", wallet.address);

    // Mock encrypted data (real BITE would generate this)
    const mockEncrypted = ethers.toUtf8Bytes("mock_encrypted_order_data_" + Date.now());

    console.log("Mock encrypted data (bytes):", ethers.hexlify(mockEncrypted));

    const orderBook = new ethers.Contract(ORDERBOOK_ADDRESS, orderBookAbi, wallet);

    console.log("Submitting mock encrypted order...");
    const tx = await orderBook.placeOrder(mockEncrypted);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Confirmed in block:", receipt.blockNumber);

    // Find OrderPlaced event
    const orderPlacedEvent = receipt.logs.find(log => 
      log.topics[0] === ethers.id("OrderPlaced(uint256,address)")
    );

    if (orderPlacedEvent) {
      const [orderId] = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], orderPlacedEvent.topics[1]);
      console.log("Order ID:", orderId.toString());
    } else {
      console.log("No OrderPlaced event found — check explorer manually");
    }

    console.log("Full receipt:", receipt);
  } catch (error) {
    console.error("Error:");
    console.error(error);
  }
}

main();