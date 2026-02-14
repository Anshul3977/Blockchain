const { ethers } = require("ethers");
require("dotenv").config();

const ORDERBOOK_ADDRESS = "0x894dE66A13414c5F06ec24de238577b3bFEa4EB7";
const orderBookAbi = [
    "function orders(uint256) view returns (bytes encryptedData, address trader, uint256 timestamp, bool executed)"
];

async function main() {
    const orderId = process.argv[2];
    if (!orderId) {
        console.error("Usage: node scripts/check-order.js <orderId>");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(process.env.SKALE_RPC);
    const orderBook = new ethers.Contract(ORDERBOOK_ADDRESS, orderBookAbi, provider);

    console.log(`\n=== Inspecting Order #${orderId} ===`);

    try {
        const order = await orderBook.orders(orderId);

        console.log(`Trader     : ${order.trader}`);
        console.log(`Timestamp  : ${new Date(Number(order.timestamp) * 1000).toLocaleString()}`);
        console.log(`Executed   : ${order.executed}`);
        console.log(`Encrypted  : ${order.encryptedData}`);

        console.log("\n--- Decoding Attempt ---");
        try {
            const utf8 = ethers.toUtf8String(order.encryptedData);
            console.log(`UTF8 String: ${utf8}`);

            try {
                const json = JSON.parse(utf8);
                console.log("JSON Parse : Success ✅");
                console.log(JSON.stringify(json, null, 2));

                if (json.limitPriceCents) {
                    console.log(`\nExtracted Limit: $${(json.limitPriceCents / 100).toFixed(2)}`);
                } else {
                    console.log("\n(No limitPriceCents found in JSON)");
                }
            } catch (e) {
                console.log("JSON Parse : Failed ❌");
                console.log("Error      :", e.message);
            }
        } catch (e) {
            console.log("UTF8 Decode: Failed ❌ (Likely raw bytes or legacy data)");
            console.log("Error      :", e.message);
        }

    } catch (error) {
        console.error("Failed to fetch order:", error.message);
    }
}

main().catch(console.error);
