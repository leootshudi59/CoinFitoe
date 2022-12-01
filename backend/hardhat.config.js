require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle")
const fs = require("fs");
const privateKey = fs.readFileSync(".secret").toString();
const ALCHEMY_PRIVATE_KEY = "g6M13KEhqZl6w7StjTDSKqpO5C1CAI6e"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_PRIVATE_KEY}`,
      accounts: [privateKey]
    },
  },
  solidity: "0.8.17",
}