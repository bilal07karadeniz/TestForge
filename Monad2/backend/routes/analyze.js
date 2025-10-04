import express from 'express';
import multer from 'multer';
import {
  analyzeContractAndGenerateTests,
  generateSecurityReport,
  analyzeContractDependencies
} from '../services/ai.service.js';
import {
  compileContract,
  deployToMonad,
  saveContractArtifacts,
  extractContractName
} from '../services/deploy.service.js';
import {
  executeContractTests,
  calculateAverageGas,
  cleanupTempFiles
} from '../services/test.service.js';
import {
  setupTestEnvironment,
  getConstructorParams
} from '../services/mock.service.js';
import { calculateScore, formatFinalReport } from '../utils/scoring.js';
import { ethers } from 'ethers';
import { MONAD_CONFIG } from '../utils/monad.config.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 } // 1MB limit
});

/**
 * POST /api/analyze
 * Main endpoint for contract analysis
 *
 * Accepts: .sol file or raw contract code in request body
 * Returns: Comprehensive analysis report with score
 */
router.post('/analyze', upload.single('contract'), async (req, res) => {
  let contractName = null;
  const io = req.app.get('io');

  try {
    // Get contract code from file upload or raw body
    let contractCode;
    if (req.file) {
      contractCode = req.file.buffer.toString('utf-8');
    } else if (req.body.contractCode) {
      contractCode = req.body.contractCode;
    } else {
      return res.status(400).json({
        error: 'No contract provided. Send a .sol file or contractCode in body.'
      });
    }

    // Extract contract name
    contractName = extractContractName(contractCode);
    console.log(`\n=== Analyzing contract: ${contractName} ===\n`);

    // Emit initial progress
    io.emit('progress', { step: 'analyzing', message: 'Analyzing contract dependencies' });

    // STEP 1: AI Dependency Analysis
    console.log('Step 1: Analyzing contract dependencies...');
    const { analysis: dependencies, usage: depUsage } = await analyzeContractDependencies(contractCode);
    console.log('✓ Dependencies analyzed');
    console.log(`  Needs Token: ${dependencies.needsToken}`);
    console.log(`  Has Payable: ${dependencies.hasPayableFunctions}`);
    console.log(`  Is Presale: ${dependencies.isPresale}`);
    console.log(`  Strategy: ${dependencies.testStrategy}`);

    // STEP 2: Setup Test Environment (Deploy Mocks)
    const provider = new ethers.JsonRpcProvider(MONAD_CONFIG.network.rpcUrl);
    const ownerWallet = new ethers.Wallet(MONAD_CONFIG.deployment.privateKey, provider);
    const testWallet = new ethers.Wallet(
      process.env.MONAD_PRIVATE_KEY_2 || '0x' + '1'.repeat(64),
      provider
    );

    let mocks = {};
    if (dependencies.needsToken || dependencies.needsNFT) {
      console.log('\nStep 2: Setting up test environment...');
      io.emit('progress', { step: 'mocks', message: 'Creating test tokens' });
      mocks = await setupTestEnvironment(dependencies, ownerWallet, testWallet);
      console.log('✓ Test environment ready');
    }

    // STEP 3: Compile Contract
    console.log('\nStep 3: Compiling main contract...');
    io.emit('progress', { step: 'compiling', message: 'Compiling contract' });
    const compiledContract = await compileContract(contractCode, contractName);
    console.log('✓ Contract compiled successfully');

    // STEP 4: Deploy to Monad Testnet with constructor params
    console.log('\nStep 4: Deploying to Monad testnet...');
    io.emit('progress', { step: 'deploying', message: 'Deploying to Monad Testnet' });
    const constructorParams = getConstructorParams(dependencies, mocks);
    console.log('Constructor params:', constructorParams);

    const deployment = await deployToMonad(compiledContract, constructorParams);
    console.log(`✓ Contract deployed at: ${deployment.address}`);
    console.log(`Explorer: ${deployment.explorer}`);

    // Save contract artifacts
    await saveContractArtifacts(contractName, contractCode, compiledContract, deployment);

    // STEP 5: Execute Tests on Deployed Contract
    console.log('\nStep 5: Testing deployed contract functions...');
    io.emit('progress', { step: 'testing', message: 'Running tests' });
    const testResults = await executeContractTests(contractName, deployment, compiledContract, dependencies, mocks);

    console.log(`✓ Tests completed: ${testResults.results.passed}/${testResults.results.total} passed`);
    if (testResults.results.failures > 0) {
      console.log(`⚠ ${testResults.results.failures} tests failed`);
    }

    // STEP 4: AI Analysis & Test Generation (for documentation)
    console.log('\nStep 4: Generating AI-powered test script...');
    const { testScript, usage: aiUsage1 } = await analyzeContractAndGenerateTests(contractCode);
    console.log('✓ Test script generated');
    console.log(`AI tokens used: ${aiUsage1.input_tokens} input, ${aiUsage1.output_tokens} output`);

    // STEP 5: Generate AI Security Report
    console.log('\nStep 5: Generating security report...');
    io.emit('progress', { step: 'reporting', message: 'Generating AI security report' });
    const { report: aiReport, usage: aiUsage2 } = await generateSecurityReport(
      contractCode,
      testResults,
      deployment
    );
    console.log('✓ Security report generated');
    console.log(`AI tokens used: ${aiUsage2.input_tokens} input, ${aiUsage2.output_tokens} output`);

    // STEP 6: Calculate Final Score
    const score = calculateScore(testResults, aiReport, deployment);
    const finalReport = formatFinalReport(score, aiReport, testResults, deployment);

    console.log(`\n=== Analysis Complete ===`);
    console.log(`Overall Score: ${finalReport.score}/100 (${finalReport.severity})`);
    console.log(`Contract: ${deployment.address}`);

    // Cleanup temp files
    await cleanupTempFiles(contractName);

    // Prepare complete data
    const completeData = {
      score: finalReport.score,
      deployment: {
        contractName,
        address: deployment.address,
        transactionHash: deployment.txHash,
        timestamp: new Date().toISOString()
      },
      testResults: {
        total: testResults.results.total,
        passed: testResults.results.passed,
        failed: testResults.results.failures,
        tests: testResults.results.tests
      },
      findings: {
        critical: finalReport.critical || [],
        warnings: finalReport.warnings || [],
        info: finalReport.info || []
      },
      gasMetrics: {
        totalGas: testResults.gasAnalysis?.totalGas || 0,
        averageGas: testResults.gasAnalysis?.averageGas || 0,
        mostExpensive: testResults.gasAnalysis?.mostExpensive || null,
        optimizationScore: testResults.gasAnalysis?.optimizationScore || 0,
        transactions: testResults.results.tests.map(t => ({
          name: t.name,
          gasUsed: t.gasUsed || 0
        }))
      },
      mocks,
      aiReport: finalReport.analysis
    };

    console.log('\n📤 Emitting complete event to frontend:');
    console.log('Score:', completeData.score);
    console.log('Contract Name:', completeData.deployment.contractName);
    console.log('Address:', completeData.deployment.address);
    console.log('Test Results:', JSON.stringify(completeData.testResults, null, 2));
    console.log('Gas Metrics:', JSON.stringify(completeData.gasMetrics, null, 2));

    // Emit completion event
    io.emit('complete', completeData);

    // Return comprehensive report
    res.json({
      success: true,
      contractName,
      report: finalReport,
      testScript, // Include generated test script for transparency
      aiUsage: {
        total_input_tokens: aiUsage1.input_tokens + aiUsage2.input_tokens,
        total_output_tokens: aiUsage1.output_tokens + aiUsage2.output_tokens
      }
    });

  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);

    // Emit error event
    io.emit('error', {
      message: error.message,
      step: 'failed'
    });

    // Cleanup on error
    if (contractName) {
      await cleanupTempFiles(contractName);
    }

    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Monad Contract Tester',
    timestamp: new Date().toISOString()
  });
});

export default router;
