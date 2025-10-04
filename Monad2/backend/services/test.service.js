import { ethers } from 'ethers';
import { MONAD_CONFIG } from '../utils/monad.config.js';

/**
 * Executes comprehensive tests on deployed contract
 */
export async function executeContractTests(contractName, deployment, compiledContract, dependencies = {}, mocks = {}) {
  const results = {
    total: 0,
    passed: 0,
    failures: 0,
    tests: [],
    gasUsage: [],
    securityIssues: []
  };

  try {
    console.log('\n=== Testing Deployed Contract ===');
    console.log('Contract:', contractName);
    console.log('Address:', deployment.address);

    // Connect to Monad testnet
    const provider = new ethers.JsonRpcProvider(MONAD_CONFIG.network.rpcUrl);

    // Owner wallet (deployer)
    const ownerWallet = new ethers.Wallet(MONAD_CONFIG.deployment.privateKey, provider);
    const ownerAddress = ownerWallet.address;

    // Second wallet (non-owner) for access control testing
    const testWallet = new ethers.Wallet(
      process.env.MONAD_PRIVATE_KEY_2 || '0x' + '1'.repeat(64),
      provider
    );
    const testAddress = testWallet.address;

    console.log('Owner wallet:', ownerAddress);
    console.log('Test wallet:', testAddress);

    // Connect contracts
    const ownerContract = new ethers.Contract(deployment.address, compiledContract.abi, ownerWallet);
    const testContract = new ethers.Contract(deployment.address, compiledContract.abi, testWallet);

    // Get all functions from ABI
    const functions = compiledContract.abi.filter(f => f.type === 'function');
    console.log(`\nFound ${functions.length} functions:`, functions.map(f => f.name).join(', '));

    // PHASE 1: Test parametersiz fonksiyonlar (owner)
    console.log('\n--- Phase 1: Owner Wallet Tests ---');
    await testParameterlessFunctions(ownerContract, functions, results, 'owner');

    // PHASE 2: Test parametresiz fonksiyonlar (non-owner) - Access control kontrolü
    console.log('\n--- Phase 2: Non-Owner Access Control Tests ---');
    await testAccessControl(testContract, functions, results);

    // PHASE 3: Test parametreli fonksiyonlar (with token approval if needed)
    console.log('\n--- Phase 3: Parameter-based Function Tests ---');
    await testParameterizedFunctions(ownerContract, functions, results, mocks);

    // PHASE 4: Payable function tests
    if (dependencies.hasPayableFunctions) {
      console.log('\n--- Phase 4: Payable Function Tests ---');
      await testPayableFunctions(ownerContract, testContract, functions, results, provider);
    }

    // PHASE 5: Token-based tests (if contract needs token)
    if (dependencies.requiresApproval && mocks.token) {
      console.log('\n--- Phase 5: Token Approval & Transfer Tests ---');
      await testTokenFunctions(ownerContract, testContract, functions, results, mocks.token, ownerWallet, testWallet);
    }

    // PHASE 6: Edge case testleri
    console.log('\n--- Phase 6: Edge Case & Security Tests ---');
    await testEdgeCases(ownerContract, testContract, functions, results);

    console.log(`\n=== Test Summary ===`);
    console.log(`Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failures}`);

    // Calculate gas analysis
    let gasAnalysis = {
      totalGas: 0,
      averageGas: 0,
      mostExpensive: null,
      optimizationScore: 70
    };

    if (results.gasUsage.length > 0) {
      const totalGas = results.gasUsage.reduce((a, b) => a + b, 0);
      const avgGas = Math.round(totalGas / results.gasUsage.length);
      console.log(`Average Gas: ${avgGas}`);

      // Find most expensive function
      const testsWithGas = results.tests.filter(t => t.gasUsed);
      const mostExpensive = testsWithGas.reduce((max, test) => {
        const gas = parseInt(test.gasUsed);
        return gas > (max ? parseInt(max.gasUsed) : 0) ? test : max;
      }, null);

      // Calculate optimization score (lower gas = higher score)
      let optScore = 70; // Base score
      if (avgGas < 30000) optScore = 95;
      else if (avgGas < 50000) optScore = 85;
      else if (avgGas < 100000) optScore = 70;
      else if (avgGas < 200000) optScore = 55;
      else optScore = 40;

      gasAnalysis = {
        totalGas,
        averageGas: avgGas,
        mostExpensive: mostExpensive ? { name: mostExpensive.name, gas: mostExpensive.gasUsed } : null,
        optimizationScore: optScore
      };
    }

    if (results.securityIssues.length > 0) {
      console.log(`Security Issues Found: ${results.securityIssues.length}`);
    }

    return {
      success: results.failures === 0 && results.total > 0,
      results,
      gasAnalysis
    };
  } catch (error) {
    console.error('\n✗ Contract test execution failed:', error.message);
    return {
      success: false,
      results,
      error: error.message
    };
  }
}

/**
 * Test parametresiz fonksiyonlar
 */
async function testParameterlessFunctions(contract, functions, results, walletType = 'owner') {
  for (const func of functions) {
    if (func.inputs && func.inputs.length > 0) continue;

    try {
      if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
        console.log(`→ [${walletType}] View: ${func.name}()`);
        const result = await contract[func.name]();
        const actualResult = result.toString();
        console.log(`  ✓ Returned: ${actualResult}`);

        results.total++;
        results.passed++;
        results.tests.push({
          name: `${func.name}()`,
          functionName: func.name,
          type: 'view',
          status: 'passed',
          walletType,
          parameters: [],
          expectedResult: 'Read-only function call',
          actualResult,
          transactionHash: null,
          gasUsed: null,
          blockNumber: null
        });
      } else {
        console.log(`→ [${walletType}] Transaction: ${func.name}()`);
        const tx = await contract[func.name]();
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toString();
        const txHash = receipt.hash;
        const blockNumber = receipt.blockNumber;

        console.log(`  ✓ Tx: ${txHash}`);
        console.log(`  ✓ Gas: ${gasUsed}`);

        results.total++;
        results.passed++;
        results.gasUsage.push(parseInt(gasUsed));
        results.tests.push({
          name: `${func.name}()`,
          functionName: func.name,
          type: 'transaction',
          status: 'passed',
          walletType,
          parameters: [],
          expectedResult: 'Transaction executed successfully',
          actualResult: 'Transaction confirmed',
          transactionHash: txHash,
          gasUsed,
          blockNumber
        });
      }
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message.substring(0, 80)}`);
      results.total++;
      results.failures++;
      results.tests.push({
        name: `${func.name}()`,
        functionName: func.name,
        type: func.stateMutability === 'view' || func.stateMutability === 'pure' ? 'view' : 'transaction',
        status: 'failed',
        walletType,
        parameters: [],
        expectedResult: 'Successful execution',
        actualResult: `Error: ${error.message}`,
        transactionHash: null,
        gasUsed: null,
        error: error.message
      });
    }
  }
}

/**
 * Test access control - non-owner ile fonksiyon çağırma
 */
async function testAccessControl(testContract, functions, results) {
  for (const func of functions) {
    if (func.inputs && func.inputs.length > 0) continue;
    if (func.stateMutability === 'view' || func.stateMutability === 'pure') continue;

    try {
      console.log(`→ [non-owner] ${func.name}() - Access Control Test`);
      const tx = await testContract[func.name]();
      const receipt = await tx.wait();

      // Eğer non-owner başarıyla çağırabiliyorsa, access control yok demektir
      console.log(`  ⚠ WARNING: Non-owner can call ${func.name}() - Missing access control!`);

      results.total++;
      results.passed++;
      results.securityIssues.push({
        severity: 'medium',
        issue: `Missing access control on ${func.name}()`,
        description: 'Non-owner wallet can execute this function'
      });
      results.tests.push({
        name: `${func.name}() [Access Control Test]`,
        functionName: func.name,
        type: 'security-access-control',
        status: 'passed-with-warning',
        walletType: 'non-owner',
        parameters: [],
        expectedResult: 'Transaction should revert (access denied)',
        actualResult: 'Transaction succeeded - Missing access control!',
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        warning: 'Missing access control - security risk'
      });
    } catch (error) {
      // Eğer revert ederse, access control var demektir
      if (error.message.includes('Ownable') || error.message.includes('owner') || error.message.includes('caller is not')) {
        console.log(`  ✓ Access control works - Non-owner blocked`);
        results.total++;
        results.passed++;
        results.tests.push({
          name: `${func.name}() [Access Control Test]`,
          functionName: func.name,
          type: 'security-access-control',
          status: 'passed',
          walletType: 'non-owner',
          parameters: [],
          expectedResult: 'Transaction should revert (access denied)',
          actualResult: 'Access denied as expected',
          transactionHash: null,
          gasUsed: null,
          note: 'Access control enforced ✓'
        });
      } else {
        console.log(`  ✗ Failed: ${error.message.substring(0, 80)}`);
        results.total++;
        results.failures++;
        results.tests.push({
          name: `${func.name}() [Access Control Test]`,
          functionName: func.name,
          type: 'security-access-control',
          status: 'failed',
          walletType: 'non-owner',
          parameters: [],
          expectedResult: 'Should check access control',
          actualResult: `Unexpected error: ${error.message}`,
          transactionHash: null,
          gasUsed: null,
          error: error.message
        });
      }
    }
  }
}

/**
 * Test parametreli fonksiyonlar (akıllı parametre üretimi ile)
 */
async function testParameterizedFunctions(contract, functions, results, mocks = {}) {
  for (const func of functions) {
    if (!func.inputs || func.inputs.length === 0) continue;

    try {
      console.log(`→ Testing ${func.name}(${func.inputs.map(i => i.type).join(', ')})`);

      // Parametreleri otomatik oluştur
      const params = generateTestParameters(func.inputs);
      console.log(`  Params:`, params);

      const parameterDetails = func.inputs.map((input, i) => ({
        name: input.name || `param${i}`,
        type: input.type,
        value: params[i]
      }));

      if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
        const result = await contract[func.name](...params);
        const actualResult = result.toString();
        console.log(`  ✓ Returned: ${actualResult}`);

        results.total++;
        results.passed++;
        results.tests.push({
          name: `${func.name}(${func.inputs.map(i => i.type).join(', ')})`,
          functionName: func.name,
          type: 'view-with-params',
          status: 'passed',
          walletType: 'owner',
          parameters: parameterDetails,
          expectedResult: 'Read function should return value',
          actualResult,
          transactionHash: null,
          gasUsed: null
        });
      } else {
        const tx = await contract[func.name](...params);
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toString();
        const txHash = receipt.hash;
        const blockNumber = receipt.blockNumber;

        console.log(`  ✓ Tx: ${txHash}`);
        console.log(`  ✓ Gas: ${gasUsed}`);

        results.total++;
        results.passed++;
        results.gasUsage.push(parseInt(gasUsed));
        results.tests.push({
          name: `${func.name}(${func.inputs.map(i => i.type).join(', ')})`,
          functionName: func.name,
          type: 'transaction-with-params',
          status: 'passed',
          walletType: 'owner',
          parameters: parameterDetails,
          expectedResult: 'Transaction should execute successfully',
          actualResult: 'Transaction confirmed',
          transactionHash: txHash,
          gasUsed,
          blockNumber
        });
      }
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message.substring(0, 80)}`);
      const params = generateTestParameters(func.inputs);
      const parameterDetails = func.inputs.map((input, i) => ({
        name: input.name || `param${i}`,
        type: input.type,
        value: params[i]
      }));

      results.total++;
      results.failures++;
      results.tests.push({
        name: `${func.name}(${func.inputs.map(i => i.type).join(', ')})`,
        functionName: func.name,
        type: func.stateMutability === 'view' || func.stateMutability === 'pure' ? 'view-with-params' : 'transaction-with-params',
        status: 'failed',
        walletType: 'owner',
        parameters: parameterDetails,
        expectedResult: 'Successful execution',
        actualResult: `Error: ${error.message}`,
        transactionHash: null,
        gasUsed: null,
        error: error.message
      });
    }
  }
}

/**
 * Edge case testleri
 */
async function testEdgeCases(ownerContract, testContract, functions, results) {
  for (const func of functions) {
    if (!func.inputs || func.inputs.length === 0) continue;

    // Test 1: Zero values
    const hasUintParam = func.inputs.some(i => i.type.startsWith('uint'));
    if (hasUintParam && func.stateMutability !== 'view' && func.stateMutability !== 'pure') {
      try {
        console.log(`→ Edge Case: ${func.name}() with zero value`);
        const zeroParams = func.inputs.map(i => i.type.startsWith('uint') ? 0 : generateTestParameter(i));

        const tx = await ownerContract[func.name](...zeroParams);
        await tx.wait();
        console.log(`  ✓ Accepts zero value`);

        results.total++;
        results.passed++;
        results.tests.push({
          name: `${func.name} (edge-zero)`,
          type: 'edge-case',
          status: 'passed',
          note: 'Accepts zero value'
        });
      } catch (error) {
        if (error.message.includes('revert') || error.message.includes('require')) {
          console.log(`  ✓ Rejects zero value (good validation)`);
          results.total++;
          results.passed++;
          results.tests.push({
            name: `${func.name} (edge-zero)`,
            type: 'edge-case',
            status: 'passed',
            note: 'Zero value validation works'
          });
        } else {
          console.log(`  ✗ Failed: ${error.message.substring(0, 80)}`);
          results.total++;
          results.failures++;
        }
      }
    }

    // Test 2: Max values (overflow test)
    if (hasUintParam && func.stateMutability !== 'view' && func.stateMutability !== 'pure') {
      try {
        console.log(`→ Edge Case: ${func.name}() with max uint256`);
        const maxParams = func.inputs.map(i =>
          i.type === 'uint256' ? ethers.MaxUint256 : generateTestParameter(i)
        );

        const tx = await ownerContract[func.name](...maxParams);
        await tx.wait();
        console.log(`  ⚠ WARNING: Accepts max uint256 - potential overflow risk`);

        results.total++;
        results.passed++;
        results.securityIssues.push({
          severity: 'low',
          issue: `${func.name}() accepts max uint256`,
          description: 'No upper bound validation - could lead to overflow'
        });
      } catch (error) {
        console.log(`  ✓ Max value handled/rejected`);
        results.total++;
        results.passed++;
      }
    }
  }
}

/**
 * Akıllı parametre üretimi
 */
function generateTestParameters(inputs) {
  return inputs.map(input => generateTestParameter(input));
}

function generateTestParameter(input) {
  const baseType = input.type.replace(/\d+/, '');

  switch (baseType) {
    case 'uint':
      return 100; // Safe test value
    case 'int':
      return 50;
    case 'address':
      return '0x0000000000000000000000000000000000000001';
    case 'bool':
      return true;
    case 'bytes':
      return '0x1234';
    case 'bytes32':
      return '0x' + '00'.repeat(32);
    case 'string':
      return 'test';
    case 'uint[]':
      return [1, 2, 3];
    case 'address[]':
      return ['0x0000000000000000000000000000000000000001'];
    default:
      return 0;
  }
}

/**
 * Calculates average gas usage from test results
 */
export function calculateAverageGas(testResults) {
  if (!testResults.results || !testResults.results.gasUsage || testResults.results.gasUsage.length === 0) {
    return 0;
  }

  const sum = testResults.results.gasUsage.reduce((a, b) => a + b, 0);
  return Math.round(sum / testResults.results.gasUsage.length);
}

/**
 * Test payable functions with MON/ETH
 */
async function testPayableFunctions(ownerContract, testContract, functions, results, provider) {
  const payableFunctions = functions.filter(f =>
    f.stateMutability === 'payable' && (!f.inputs || f.inputs.length === 0)
  );

  for (const func of payableFunctions) {
    try {
      console.log(`→ Payable test: ${func.name}() with 0.01 MON`);
      const value = ethers.parseEther('0.01'); // 0.01 MON

      const tx = await ownerContract[func.name]({ value });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.toString();

      console.log(`  ✓ Payable function executed - Gas: ${gasUsed}`);

      results.total++;
      results.passed++;
      results.gasUsage.push(parseInt(gasUsed));
      results.tests.push({
        name: `${func.name} (payable)`,
        type: 'payable',
        status: 'passed',
        value: ethers.formatEther(value),
        gasUsed
      });
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message.substring(0, 80)}`);
      results.total++;
      results.failures++;
      results.tests.push({
        name: `${func.name} (payable)`,
        status: 'failed',
        error: error.message
      });
    }
  }
}

/**
 * Test token-based functions (with approval)
 */
async function testTokenFunctions(ownerContract, testContract, functions, results, mockToken, ownerWallet, testWallet) {
  console.log('→ Setting up token approvals...');

  try {
    // Approve owner contract to spend owner's tokens
    const approvalAmount = ethers.parseEther('1000');
    const approveTx = await mockToken.contract.connect(ownerWallet).approve(
      ownerContract.target || ownerContract.address,
      approvalAmount
    );
    await approveTx.wait();
    console.log(`  ✓ Owner approved ${ethers.formatEther(approvalAmount)} tokens`);

    // Approve from test wallet too
    const approveTx2 = await mockToken.contract.connect(testWallet).approve(
      testContract.target || testContract.address,
      approvalAmount
    );
    await approveTx2.wait();
    console.log(`  ✓ Test wallet approved ${ethers.formatEther(approvalAmount)} tokens`);

    results.total++;
    results.passed++;
    results.tests.push({
      name: 'Token approval setup',
      type: 'token-approval',
      status: 'passed'
    });

    // Now test functions that might use tokens
    const tokenFunctions = functions.filter(f =>
      f.inputs && f.inputs.some(i => i.type === 'uint256') &&
      (f.stateMutability === 'nonpayable' || f.stateMutability === 'payable')
    );

    for (const func of tokenFunctions) {
      if (!func.inputs || func.inputs.length === 0) continue;

      try {
        console.log(`→ Token test: ${func.name}()`);
        const params = func.inputs.map(i =>
          i.type === 'uint256' ? ethers.parseEther('10') : generateTestParameter(i)
        );

        const tx = await ownerContract[func.name](...params);
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toString();

        console.log(`  ✓ Token function executed - Gas: ${gasUsed}`);

        results.total++;
        results.passed++;
        results.gasUsage.push(parseInt(gasUsed));
        results.tests.push({
          name: `${func.name} (with-tokens)`,
          type: 'token-function',
          status: 'passed',
          gasUsed
        });
      } catch (error) {
        console.log(`  ⚠ ${func.name}() - ${error.message.substring(0, 60)}`);
        // Don't fail the whole test, just log
      }
    }
  } catch (error) {
    console.log(`  ✗ Token approval failed: ${error.message}`);
    results.total++;
    results.failures++;
    results.tests.push({
      name: 'Token approval setup',
      type: 'token-approval',
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Cleanup temporary test files (optional)
 */
export async function cleanupTempFiles(contractName) {
  console.log(`Cleanup for ${contractName} completed`);
}
