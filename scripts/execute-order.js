const { ethers } = require("ethers");
require("dotenv").config();

const ORDERBOOK_ADDRESS = "0x894dE66A13414c5F06ec24de238577b3bFEa4EB7";
const orderBookAbi = ["function executeOrder(uint256 orderId) external"];

async function main() {
    // Default to Order #10 (latest fresh order) if no argument provided
    const orderId = process.argv[2] || "10";

    const provider = new ethers.JsonRpcProvider(process.env.SKALE_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const orderBook = new ethers.Contract(ORDERBOOK_ADDRESS, orderBookAbi, wallet);

    console.log(`Executing Order #${orderId}...`);
    try {
        const tx = await orderBook.executeOrder(orderId);
        console.log("Tx sent:", tx.hash);

        const receipt = await tx.wait();
        console.log(`✅ Order #${orderId} executed in block ${receipt.blockNumber}`);
    } catch (error) {
        console.error("Execution failed:", error.message);
    }
}

main().catch(console.error);
