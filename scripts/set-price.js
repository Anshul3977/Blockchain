// Usage: node scripts/set-price.js <cents>
// Example: node scripts/set-price.js 65   → sets oracle to $0.65
// Example: node scripts/set-price.js 25   → sets oracle to $0.25

const { ethers } = require("ethers");
require("dotenv").config();

const ORACLE_ADDRESS = "0x503a2A1739B1cEB4067916bA9e26E25494BF9f43";
const oracleAbi = ["function updatePrice(uint256 newPrice) external"];

async function main() {
    const cents = parseInt(process.argv[2]);
    if (!cents || cents <= 0) {
        console.error("Usage: node scripts/set-price.js <cents>");
        console.error("  e.g. node scripts/set-price.js 65  → $0.65");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(process.env.SKALE_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, wallet);

    console.log(`Setting oracle price to ${cents} cents ($${(cents / 100).toFixed(2)})...`);
    const tx = await oracle.updatePrice(cents);
    const receipt = await tx.wait();
    console.log(`✅ Price updated to $${(cents / 100).toFixed(2)} — tx: ${receipt.hash}`);
}

main().catch(console.error);
