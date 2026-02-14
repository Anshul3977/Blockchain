const { ethers } = require("ethers");
require("dotenv").config();

const ORDERBOOK_ADDRESS = "0x894dE66A13414c5F06ec24de238577b3bFEa4EB7";
const ORACLE_ADDRESS = "0x503a2A1739B1cEB4067916bA9e26E25494BF9f43";

const orderBookAbi = [
    "function executeOrder(uint256 orderId) external",
    "function orders(uint256) view returns (bytes encryptedData, address trader, uint256 timestamp, bool executed)"
];
const oracleAbi = ["function price() view returns (uint256)"];

async function main() {
    const orderId = process.argv[2];
    if (!orderId) {
        console.error("Usage: node scripts/execute-single-order.js <orderId>");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(process.env.SKALE_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const orderBook = new ethers.Contract(ORDERBOOK_ADDRESS, orderBookAbi, wallet);
    const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, provider);

    console.log(`\n=== Manual Execution: Order #${orderId} ===`);

    try {
        // 1. Get Current Price
        const price = await oracle.price();
        const currentCents = Number(price);
        const currentUSD = (currentCents / 100).toFixed(2);
        console.log(`Current Oracle Price: $${currentUSD}`);

        // 2. Get Order Details
        const order = await orderBook.orders(orderId);
        let limitUSD = "?.??";

        try {
            const json = ethers.toUtf8String(order.encryptedData);
            const parsed = JSON.parse(json);
            if (parsed.limitPriceCents) {
                limitUSD = (parsed.limitPriceCents / 100).toFixed(2);
            }
        } catch {
            console.log("(Could not decode limit price)");
        }

        console.log(`Order #${orderId} Limit   : $${limitUSD}`);
        console.log(`Status              : ${order.executed ? "ALREADY EXECUTED" : "Waiting"}`);

        if (order.executed) {
            console.log("❌ Cannot execute (already done).");
            return;
        }

        // 3. Execute
        console.log(`\nExecuting Order #${orderId}...`);
        const tx = await orderBook.executeOrder(orderId);
        console.log(`Tx Sent: ${tx.hash}`);

        console.log("Waiting for confirmation...");
        const receipt = await tx.wait();
        console.log(`✅ Success! Block: ${receipt.blockNumber}`);

    } catch (error) {
        console.error("Execution failed:", error.message);
    }
}

main().catch(console.error);
