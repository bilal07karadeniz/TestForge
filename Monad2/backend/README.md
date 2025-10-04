# Monad AI Contract Tester - Backend

AI-powered smart contract testing platform for Monad blockchain using Claude Sonnet 4.5.

## Features

- 🤖 AI-powered test generation using Claude Sonnet 4.5
- 🔒 Comprehensive security analysis
- ⛽ Gas optimization recommendations
- 🧪 Automated Hardhat test execution
- 🚀 Direct deployment to Monad testnet
- 📊 Detailed scoring system (0-100)

## Tech Stack

- Node.js + Express
- Anthropic Claude API (claude-sonnet-4-5-20250929)
- ethers.js v6
- Hardhat
- solc compiler

## Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
Edit `.env` file and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

3. **Start server:**
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST /api/analyze

Analyzes a Solidity contract and returns comprehensive report.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data` or `application/json`

**Option 1: File Upload**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "contract=@MyContract.sol"
```

**Option 2: JSON Body**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "contractCode": "pragma solidity ^0.8.0; contract MyContract { ... }"
  }'
```

**Response:**
```json
{
  "success": true,
  "contractName": "MyContract",
  "report": {
    "score": 85,
    "severity": "Good",
    "breakdown": {
      "testing": {
        "score": 90,
        "total": 10,
        "passed": 9,
        "failed": 1
      },
      "security": {
        "score": 85,
        "critical": [],
        "warnings": ["Consider using ReentrancyGuard"]
      },
      "gas": {
        "score": 80,
        "rating": "Well Optimized",
        "analysis": {
          "deploymentGas": "523456",
          "averageFunctionGas": "45000"
        }
      }
    },
    "deployment": {
      "network": "Monad Testnet",
      "address": "0x...",
      "txHash": "0x...",
      "explorer": "https://testnet.monadexplorer.com/address/0x..."
    },
    "recommendations": [
      "Add input validation for zero addresses",
      "Consider using SafeMath for arithmetic operations"
    ],
    "summary": "Contract is well-structured with minor security improvements needed"
  },
  "testScript": "const { expect } = require('chai'); ...",
  "aiUsage": {
    "total_input_tokens": 2500,
    "total_output_tokens": 1800
  }
}
```

### GET /api/health

Health check endpoint.

```bash
curl http://localhost:3000/api/health
```

## Workflow

1. **Upload Contract** → User sends .sol file or contract code
2. **AI Analysis** → Claude generates comprehensive Hardhat test script
3. **Compilation** → Contract compiled with solc
4. **Deployment** → Contract deployed to Monad testnet
5. **Testing** → AI-generated tests executed via Hardhat
6. **Security Report** → Claude analyzes results and generates final report
7. **Scoring** → System calculates 0-100 score with detailed breakdown

## Monad Testnet Configuration

- **Network:** Monad Testnet
- **Chain ID:** 10143
- **RPC URL:** https://rpc.ankr.com/monad_testnet
- **Explorer:** https://testnet.monadexplorer.com
- **Currency:** MON

## Project Structure

```
backend/
├── server.js                 # Express server entry point
├── hardhat.config.js        # Hardhat configuration for Monad
├── routes/
│   └── analyze.js           # Main API route
├── services/
│   ├── ai.service.js        # Claude API integration
│   ├── deploy.service.js    # Contract compilation & deployment
│   └── test.service.js      # Hardhat test execution
├── utils/
│   ├── monad.config.js      # Monad network configuration
│   └── scoring.js           # Score calculation logic
├── temp/                    # Temporary files (auto-cleanup)
│   ├── contracts/
│   ├── tests/
│   └── artifacts/
└── package.json
```

## Error Handling

All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Stack trace (development only)"
}
```

## Security Notes

- Private key is stored in `.env` (never commit!)
- `.gitignore` excludes sensitive files
- Input validation on all endpoints
- File size limits enforced (1MB)

## Development

Run with nodemon for auto-reload:
```bash
npm run dev
```

## License

MIT
