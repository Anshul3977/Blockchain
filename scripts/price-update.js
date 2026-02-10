const { ethers } = require("ethers");
require("dotenv").config();

const ORACLE_ADDRESS = "0x503a2A1739B1cEB4067916bA9e26E25494BF9f43";

const oracleAbi = [
  "function updatePrice(uint256 newPrice) external",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SKALE_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleAbi, wallet);

  const newPrice = 45; // 0.45 USDC < 0.50 limit → should trigger in monitor
  console.log("Updating oracle price to", newPrice, "cents");

  const tx = await oracle.updatePrice(newPrice);
  const receipt = await tx.wait();

  console.log("Price updated! Tx hash:", receipt.hash);
}

main().catch(console.error);