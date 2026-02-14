const { ethers } = require("ethers");
require("dotenv").config();
const { execSync } = require("child_process");

const CONTRACTS = {
    orderBook: "0x894dE66A13414c5F06ec24de238577b3bFEa4EB7",
    oracle: "0x503a2A1739B1cEB4067916bA9e26E25494BF9f43"
};

const oracleAbi = ["function price() view returns (uint256)"];
const orderBookAbi = ["function orders(uint256) view returns (bytes encryptedData, address trader, uint256 timestamp, bool executed)"];

async function main() {
    console.log("🔍 Checking Demo Readiness...\n");
    let allGood = true;

    // 1. Check Monitor
    try {
        const ps = execSync("pgrep -f monitor-and-execute.js").toString();
        console.log("✅ Monitor script is running (PID: " + ps.trim() + ")");
    } catch (e) {
        console.log("❌ Monitor script is NOT running!");
        console.log("   Run: node scripts/monitor-and-execute.js");
        allGood = false;
    }

    const provider = new ethers.JsonRpcProvider(process.env.SKALE_RPC);

    // 2. Check Price
    try {
        const oracle = new ethers.Contract(CONTRACTS.oracle, oracleAbi, provider);
        const price = await oracle.price();
        const priceCents = Number(price);
        if (priceCents === 45) {
            console.log("✅ Oracle price is 45 cents");
        } else {
            console.log(`❌ Oracle price is ${priceCents} cents (Expected: 45)`);
            console.log("   Run: node scripts/set-price.js 45");
            allGood = false;
        }
    } catch (e) {
        console.log("❌ Failed to fetch price: " + e.message);
        allGood = false;
    }

    // 3. Check Order #10 (Latest)
    try {
        const orderBook = new ethers.Contract(CONTRACTS.orderBook, orderBookAbi, provider);
        const order = await orderBook.orders(10);

        try {
            const json = ethers.toUtf8String(order.encryptedData);
            const parsed = JSON.parse(json);
            if (parsed.limitPriceCents === 50) {
                console.log("✅ Order #10 exists with limit 50 cents");
            } else {
                console.log(`❌ Order #10 limit is ${parsed.limitPriceCents} cents (Expected: 50)`);
                allGood = false;
            }
        } catch {
            console.log("❌ Order #10 data not decodable");
            allGood = false;
        }
    } catch (e) {
        console.log("❌ Failed to fetch Order #10: " + e.message);
        allGood = false;
    }

    // 4. Verification
    console.log("\nFrontend Check:");
    console.log("   Open http://localhost:8080");
    console.log("   Ensure MetaMask is connected to SKALE Testnet");

    console.log("\n" + "=".repeat(30));
    if (allGood) {
        console.log("✅ READY FOR DEMO! 🚀");
    } else {
        console.log("❌ Please fix the issues above before recording.");
    }
}

main().catch(console.error);
