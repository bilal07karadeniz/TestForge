import dotenv from 'dotenv';
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    monad: {
      url: process.env.MONAD_RPC_URL || 'https://rpc.ankr.com/monad_testnet',
      chainId: 10143,
      accounts: [process.env.MONAD_PRIVATE_KEY],
      gasLimit: 8000000,
      timeout: 60000
    }
  },
  paths: {
    sources: "./temp/contracts",
    tests: "./temp/tests",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 120000
  }
};
