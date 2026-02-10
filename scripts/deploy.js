const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // Deploy Mock TOKEN
  const MockTOKEN = await hre.ethers.getContractFactory("MockERC20");
  const token = await MockTOKEN.deploy("Mock TOKEN", "TOKEN", 1000000000);
  await token.waitForDeployment();
  console.log("Mock TOKEN:", await token.getAddress());

  // Deploy Mock USDC
  const MockUSDC = await hre.ethers.getContractFactory("MockERC20");
  const usdc = await MockUSDC.deploy("Mock USDC", "USDC", 1000000000);
  await usdc.waitForDeployment();
  console.log("Mock USDC:", await usdc.getAddress());

  // Deploy DEX
  const SimpleDEX = await hre.ethers.getContractFactory("SimpleDEX");
  const dex = await SimpleDEX.deploy(await token.getAddress(), await usdc.getAddress());
  await dex.waitForDeployment();
  console.log("SimpleDEX:", await dex.getAddress());

  // Deploy Oracle
  const MockPriceOracle = await hre.ethers.getContractFactory("MockPriceOracle");
  const oracle = await MockPriceOracle.deploy();
  await oracle.waitForDeployment();
  console.log("MockPriceOracle:", await oracle.getAddress());

  // Deploy OrderBook
  const EncryptedOrderBook = await hre.ethers.getContractFactory("EncryptedOrderBook");
  const orderBook = await EncryptedOrderBook.deploy();
  await orderBook.waitForDeployment();
  console.log("EncryptedOrderBook:", await orderBook.getAddress());

  console.log("Deployment complete! Copy addresses for next steps.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});