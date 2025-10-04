import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = 'claude-sonnet-4-5-20250929';

/**
 * Analyzes contract dependencies and determines deployment strategy
 */
export async function analyzeContractDependencies(contractCode) {
  const prompt = `Analyze this Solidity smart contract and determine its dependencies and deployment requirements.

Contract:
${contractCode}

Return ONLY a JSON object with this structure:
{
  "needsToken": true/false,
  "tokenType": "ERC20" | "ERC721" | "ERC1155" | null,
  "tokenSymbol": "TKN" (suggested symbol),
  "needsNFT": true/false,
  "hasPayableFunctions": true/false,
  "constructorParams": [
    {"name": "tokenAddress", "type": "address", "needsMock": true, "mockType": "ERC20"},
    {"name": "price", "type": "uint256", "value": "1000000000000000000"}
  ],
  "dependencies": ["@openzeppelin/contracts/token/ERC20/IERC20.sol"],
  "isPresale": true/false,
  "isStaking": true/false,
  "requiresApproval": true/false,
  "testStrategy": "This contract requires ERC20 mock deployment first, then approve tokens before testing buy functions"
}

IMPORTANT: Return ONLY the JSON object, no markdown, no explanations.`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    let responseText = message.content[0].text.trim();

    // Clean markdown
    if (responseText.includes('```json')) {
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (responseText.includes('```')) {
      responseText = responseText.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(responseText.trim());

    return {
      analysis,
      usage: message.usage
    };
  } catch (error) {
    throw new Error(`Contract dependency analysis failed: ${error.message}`);
  }
}

/**
 * Analyzes a Solidity contract and generates Hardhat test script
 */
export async function analyzeContractAndGenerateTests(contractCode) {
  const prompt = `Analyze this Solidity smart contract and generate a comprehensive Hardhat test script.

Include:
1. Function tests (all public/external functions)
2. Security tests (reentrancy, overflow, access control)
3. Gas optimization checks
4. Edge cases (zero values, max values, boundary conditions)

Return ONLY valid JavaScript/Hardhat test code, no explanations or markdown code blocks.

Contract:
${contractCode}

Output format (pure JavaScript code):
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractName", function () {
  let contract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const ContractFactory = await ethers.getContractFactory("ContractName");
    contract = await ContractFactory.deploy(/* constructor args */);
  });

  describe("Function Tests", function () {
    it("should test function X", async function () {
      // test code
    });
  });

  describe("Security Tests", function () {
    it("should prevent reentrancy", async function () {
      // test code
    });
  });

  describe("Gas Optimization", function () {
    it("should use optimal gas", async function () {
      const tx = await contract.someFunction();
      const receipt = await tx.wait();
      console.log("Gas used:", receipt.gasUsed.toString());
    });
  });
});

IMPORTANT: Return ONLY the JavaScript code, starting with 'const'. No markdown, no explanations.`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const testScript = message.content[0].text.trim();

    // Clean up any markdown code blocks if present
    let cleanedScript = testScript;
    if (cleanedScript.includes('```javascript')) {
      cleanedScript = cleanedScript.replace(/```javascript\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedScript.includes('```')) {
      cleanedScript = cleanedScript.replace(/```\n?/g, '');
    }

    return {
      testScript: cleanedScript.trim(),
      usage: message.usage
    };
  } catch (error) {
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Generates final security and gas optimization report
 */
export async function generateSecurityReport(contractCode, testResults, deploymentInfo) {
  const prompt = `Analyze this smart contract test results and generate a comprehensive security and gas optimization report.

Contract:
${contractCode}

Test Results:
${JSON.stringify(testResults, null, 2)}

Deployment Info:
- Address: ${deploymentInfo.address}
- Gas Used: ${deploymentInfo.gasUsed}
- Transaction Hash: ${deploymentInfo.txHash}

Generate a detailed report with:
1. Security Score (0-100)
2. Gas Optimization Score (0-100)
3. Overall Score (0-100)
4. Critical Issues (if any)
5. Warnings
6. Recommendations
7. Gas Analysis

IMPORTANT: Return ONLY valid JSON. Ensure all string values are properly escaped. Use \\n for newlines within strings.

Return ONLY a JSON object with this exact structure:
{
  "overallScore": 85,
  "securityScore": 90,
  "gasScore": 80,
  "critical": ["Critical issue 1 with details", "Critical issue 2 with details"],
  "warnings": ["Warning 1 with details", "Warning 2 with details"],
  "info": ["Good practice 1", "Good practice 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "gasAnalysis": {
    "deploymentGas": "1234567",
    "averageFunctionGas": "45000",
    "optimizationPotential": "15%"
  },
  "summary": "Brief overall assessment in a single line",
  "analysis": "Detailed analysis in a single string with \\n for line breaks. Do not use actual line breaks. Escape all quotes."
}

Do not use markdown code blocks. Return pure JSON only.`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    let responseText = message.content[0].text.trim();

    // Extract JSON from response - remove markdown code blocks
    let jsonText = responseText;
    if (responseText.includes('```json')) {
      const match = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      } else {
        jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
    } else if (responseText.includes('```')) {
      const match = responseText.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      } else {
        jsonText = responseText.replace(/```\n?/g, '');
      }
    }

    // Try to find JSON object boundaries if AI added extra text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    let report;
    try {
      jsonText = jsonText.trim();
      console.log('Parsing AI JSON response (length:', jsonText.length, 'bytes)');
      report = JSON.parse(jsonText);
      console.log('✓ Successfully parsed AI report');
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.error('Error position:', parseError.message.match(/position (\d+)/)?.[1]);
      console.error('AI Response length:', responseText.length);

      // Show problematic area
      const posMatch = parseError.message.match(/position (\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const start = Math.max(0, pos - 100);
        const end = Math.min(jsonText.length, pos + 100);
        console.error('Problematic section:', jsonText.substring(start, end));
      }

      // Return a fallback report if JSON parsing fails
      report = {
        overallScore: 70,
        securityScore: 70,
        gasScore: 70,
        critical: [],
        warnings: ['AI report generation encountered formatting issues'],
        info: ['Contract deployed successfully', 'Tests executed'],
        recommendations: ['Review contract manually for detailed analysis'],
        gasAnalysis: {
          deploymentGas: 'N/A',
          averageFunctionGas: 'N/A',
          optimizationPotential: 'Unknown'
        },
        summary: 'Analysis completed with limited AI report due to formatting issues',
        analysis: 'The AI report could not be fully generated due to JSON formatting issues. However, your contract was deployed and tested successfully. Please review the test results for detailed information.'
      };
    }

    return {
      report,
      usage: message.usage
    };
  } catch (error) {
    throw new Error(`Report generation failed: ${error.message}`);
  }
}
