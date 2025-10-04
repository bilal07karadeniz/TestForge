import dotenv from 'dotenv';
dotenv.config();

export const MONAD_CONFIG = {
  network: {
    name: 'Monad Testnet',
    chainId: 10143,
    rpcUrl: process.env.MONAD_RPC_URL || 'https://rpc.ankr.com/monad_testnet',
    explorer: 'https://testnet.monadscan.com',
    currency: 'MON'
  },
  deployment: {
    privateKey: process.env.MONAD_PRIVATE_KEY,
    gasLimit: 8000000,
    gasPrice: null // Let network determine gas price
  }
};

export function validateConfig() {
  if (!MONAD_CONFIG.deployment.privateKey) {
    throw new Error('MONAD_PRIVATE_KEY not found in environment variables');
  }

  if (!MONAD_CONFIG.network.rpcUrl) {
    throw new Error('MONAD_RPC_URL not found in environment variables');
  }

  return true;
}
