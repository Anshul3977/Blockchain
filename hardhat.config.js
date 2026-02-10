require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    titan: {
      url: process.env.SKALE_RPC || "https://testnet.skalenodes.com/v1/aware-fake-trim-testnet",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1020352220,
      timeout: 60000,  // Increase if deploy hangs
    },
  },
};