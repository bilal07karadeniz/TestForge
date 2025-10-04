import { ethers } from 'ethers';
import { compileContract } from './deploy.service.js';
import { MONAD_CONFIG } from '../utils/monad.config.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Deploys mock contracts based on dependencies
 */
export async function deployMockContracts(dependencies, ownerWallet) {
  const mocks = {};

  console.log('\n=== Deploying Mock Contracts ===');

  // Deploy Mock ERC20 if needed
  if (dependencies.needsToken && dependencies.tokenType === 'ERC20') {
    console.log('→ Deploying Mock ERC20 Token...');
    const tokenName = dependencies.tokenSymbol || 'MockToken';
    const tokenSymbol = dependencies.tokenSymbol || 'MTK';
    const initialSupply = 1000000; // 1M tokens

    const mockToken = await deployMockERC20(tokenName, tokenSymbol, initialSupply, ownerWallet);
    mocks.token = mockToken;

    console.log(`  ✓ Mock ERC20 deployed: ${mockToken.address}`);
    console.log(`  Token: ${tokenName} (${tokenSymbol})`);
    console.log(`  Supply: ${initialSupply} tokens`);
  }

  return mocks;
}

/**
 * Deploy Mock ERC20 Token
 */
async function deployMockERC20(name, symbol, initialSupply, wallet) {
  try {
    // Read MockERC20 contract
    const contractPath = path.join(process.cwd(), 'contracts', 'MockERC20.sol');
    const contractCode = await fs.readFile(contractPath, 'utf-8');

    // Compile
    const compiled = await compileContract(contractCode, 'MockERC20');

    // Deploy with constructor params
    const factory = new ethers.ContractFactory(
      compiled.abi,
      compiled.bytecode,
      wallet
    );

    const contract = await factory.deploy(name, symbol, initialSupply, {
      gasLimit: MONAD_CONFIG.deployment.gasLimit
    });

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    return {
      address,
      contract,
      abi: compiled.abi,
      name,
      symbol,
      initialSupply
    };
  } catch (error) {
    throw new Error(`Mock ERC20 deployment failed: ${error.message}`);
  }
}

/**
 * Setup test environment with mocks
 */
export async function setupTestEnvironment(dependencies, ownerWallet, testWallet) {
  const mocks = await deployMockContracts(dependencies, ownerWallet);

  // Fund test wallets with mock tokens
  if (mocks.token) {
    console.log('\n=== Funding Test Wallets ===');

    const fundAmount = ethers.parseEther('10000'); // 10k tokens

    // Transfer to test wallet
    console.log('→ Funding test wallet with tokens...');
    const tx = await mocks.token.contract.transfer(testWallet.address, fundAmount);
    await tx.wait();
    console.log(`  ✓ Sent ${ethers.formatEther(fundAmount)} ${mocks.token.symbol} to test wallet`);

    // Check balances
    const ownerBalance = await mocks.token.contract.balanceOf(ownerWallet.address);
    const testBalance = await mocks.token.contract.balanceOf(testWallet.address);

    console.log(`  Owner balance: ${ethers.formatEther(ownerBalance)} ${mocks.token.symbol}`);
    console.log(`  Test balance: ${ethers.formatEther(testBalance)} ${mocks.token.symbol}`);
  }

  return mocks;
}

/**
 * Get constructor parameters with mock addresses
 */
export function getConstructorParams(dependencies, mocks) {
  if (!dependencies.constructorParams || dependencies.constructorParams.length === 0) {
    return [];
  }

  return dependencies.constructorParams.map(param => {
    // If it needs a mock contract, use the deployed mock address
    if (param.needsMock) {
      if (param.mockType === 'ERC20' && mocks.token) {
        console.log(`  Using mock token address for ${param.name}: ${mocks.token.address}`);
        return mocks.token.address;
      }
    }

    // Otherwise use the suggested value
    if (param.value !== undefined) {
      return param.value;
    }

    // Default values by type
    switch (param.type) {
      case 'address':
        return ethers.ZeroAddress;
      case 'uint256':
        return 0;
      case 'bool':
        return false;
      default:
        return 0;
    }
  });
}
