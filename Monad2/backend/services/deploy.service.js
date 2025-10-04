import solc from 'solc';
import { ethers } from 'ethers';
import fs from 'fs/promises';
import path from 'path';
import { MONAD_CONFIG } from '../utils/monad.config.js';

/**
 * Compiles a Solidity contract
 */
export async function compileContract(contractCode, contractName) {
  try {
    // Create input for solc compiler
    const input = {
      language: 'Solidity',
      sources: {
        [`${contractName}.sol`]: {
          content: contractCode
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode', 'evm.gasEstimates']
          }
        },
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for compilation errors
    if (output.errors) {
      const errors = output.errors.filter(e => e.severity === 'error');
      if (errors.length > 0) {
        throw new Error(`Compilation failed: ${errors.map(e => e.message).join('\n')}`);
      }
    }

    const contract = output.contracts[`${contractName}.sol`][contractName];

    if (!contract) {
      throw new Error(`Contract ${contractName} not found in compilation output`);
    }

    return {
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object,
      deployedBytecode: contract.evm.deployedBytecode.object,
      gasEstimates: contract.evm.gasEstimates
    };
  } catch (error) {
    throw new Error(`Contract compilation failed: ${error.message}`);
  }
}

/**
 * Deploys a compiled contract to Monad testnet
 */
export async function deployToMonad(compiledContract, constructorArgs = []) {
  try {
    // Connect to Monad testnet
    const provider = new ethers.JsonRpcProvider(MONAD_CONFIG.network.rpcUrl);

    // Create wallet from private key
    const wallet = new ethers.Wallet(MONAD_CONFIG.deployment.privateKey, provider);

    console.log('Deploying from address:', wallet.address);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Wallet balance:', ethers.formatEther(balance), 'MON');

    if (balance === 0n) {
      throw new Error('Insufficient balance for deployment. Please fund the wallet with MON tokens from Monad testnet faucet.');
    }

    // Estimate deployment cost
    const estimatedGas = BigInt(MONAD_CONFIG.deployment.gasLimit);
    console.log('Estimated gas limit:', estimatedGas.toString());

    // Create contract factory
    const factory = new ethers.ContractFactory(
      compiledContract.abi,
      compiledContract.bytecode,
      wallet
    );

    // Deploy contract
    console.log('Deploying contract to Monad testnet...');

    // Monad - let the network handle gas prices automatically
    const deployOptions = {
      gasLimit: MONAD_CONFIG.deployment.gasLimit
    };

    console.log('Using auto gas settings for Monad testnet:', {
      gasLimit: deployOptions.gasLimit,
      note: 'Gas price will be determined by network'
    });

    const contract = await factory.deploy(...constructorArgs, deployOptions);

    // Wait for deployment
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();

    console.log('Contract deployed at:', address);
    console.log('Transaction hash:', deploymentTx.hash);

    // Get deployment receipt for gas info
    const receipt = await deploymentTx.wait();

    return {
      address,
      txHash: deploymentTx.hash,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber,
      explorer: `${MONAD_CONFIG.network.explorer}/address/${address}`,
      contract
    };
  } catch (error) {
    throw new Error(`Deployment to Monad testnet failed: ${error.message}`);
  }
}

/**
 * Saves contract artifacts to temp directory
 */
export async function saveContractArtifacts(contractName, contractCode, compiledContract, deployment) {
  try {
    const artifactsDir = path.join(process.cwd(), 'temp', 'artifacts');
    await fs.mkdir(artifactsDir, { recursive: true });

    const artifact = {
      contractName,
      sourceCode: contractCode,
      abi: compiledContract.abi,
      bytecode: compiledContract.bytecode,
      deployment: {
        network: MONAD_CONFIG.network.name,
        chainId: MONAD_CONFIG.network.chainId,
        address: deployment.address,
        txHash: deployment.txHash,
        gasUsed: deployment.gasUsed,
        blockNumber: deployment.blockNumber,
        explorer: deployment.explorer,
        timestamp: new Date().toISOString()
      }
    };

    const artifactPath = path.join(artifactsDir, `${contractName}.json`);
    await fs.writeFile(artifactPath, JSON.stringify(artifact, null, 2));

    return artifactPath;
  } catch (error) {
    console.error('Failed to save artifacts:', error.message);
    // Non-critical error, don't throw
    return null;
  }
}

/**
 * Extracts contract name from Solidity code
 */
export function extractContractName(contractCode) {
  const match = contractCode.match(/contract\s+(\w+)/);
  if (!match) {
    throw new Error('Could not find contract name in source code');
  }
  return match[1];
}
