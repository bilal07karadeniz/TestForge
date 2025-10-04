# 🔥 TestForge - AI-Powered Smart Contract Testing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Monad](https://img.shields.io/badge/Network-Monad%20Testnet-blue.svg)](https://monad.xyz)
[![Claude AI](https://img.shields.io/badge/AI-Claude%20Sonnet%204.5-purple.svg)](https://www.anthropic.com/claude)

**TestForge** is a comprehensive, AI-powered smart contract testing platform that automatically deploys, tests, and analyzes Solidity contracts on Monad Testnet. Built for the Monad Hackathon.

![TestForge Banner](https://via.placeholder.com/1200x400/1E293B/10B981?text=TestForge+-+AI+Smart+Contract+Testing)

---

## ✨ Features

### 🤖 AI-Powered Analysis
- **Claude Sonnet 4.5** integration for intelligent contract analysis
- Automatic test case generation based on contract logic
- Security vulnerability detection
- Gas optimization recommendations

### 🧪 Comprehensive Testing
- **100% function coverage** - Tests every function in your contract
- **Expected vs Actual** result comparison for every test
- **Transaction hashes** for all write operations
- **Multi-wallet testing** (owner/non-owner) for access control
- **Edge case testing** (zero values, max uint256, overflow protection)
- **Parameter validation** with automatic test data generation

### 📊 Advanced Analytics
- **Function Coverage Tracker** - Ensure all functions are tested
- **Gas Metrics Dashboard** - Track gas usage for every function
- **Security Findings** - Categorized by severity (Critical/Warning/Info)
- **Gas Optimization Tips** - Smart recommendations based on actual usage
- **Test History** - Track improvements over time

### 🎯 Developer-Friendly
- **Export test results** to CSV/JSON
- **Transaction explorer links** for every deployment and test
- **Real-time progress tracking** with percentages
- **Detailed error reporting** with stack traces
- **Downloadable reports** in multiple formats

### 🔗 Blockchain Integration
- **Monad Testnet** deployment and testing
- **Automatic mock token deployment** for ERC20/ERC721 contracts
- **Multi-network support** (easily configurable)
- **Block explorer integration** (Monadscan)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **Monad Testnet** wallet with MON tokens
- **Anthropic API Key** for AI features

### Installation

```bash
# Clone the repository
git clone https://github.com/bilal07karadeniz/TestForge.git
cd TestForge

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. **Backend Setup** (`backend/.env`):

```env
# Monad Network
MONAD_PRIVATE_KEY=your_private_key_here
MONAD_PRIVATE_KEY_2=second_wallet_for_testing
MONAD_RPC_URL=https://rpc.ankr.com/monad_testnet

# AI Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Server
PORT=3000
NODE_ENV=development
```

2. **Frontend Setup** (optional - `frontend/.env`):

```env
VITE_API_URL=http://localhost:3000
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📖 Usage

### 1. Upload Your Contract

- **File Upload**: Drag and drop your `.sol` file
- **Paste Code**: Copy and paste your Solidity code directly

### 2. Automatic Analysis

The platform will automatically:
1. ✅ Analyze contract dependencies (ERC20, ERC721, etc.)
2. ✅ Deploy mock tokens if needed
3. ✅ Compile the contract
4. ✅ Deploy to Monad Testnet
5. ✅ Execute comprehensive tests
6. ✅ Generate AI security report

### 3. Review Results

View detailed results including:
- **Function Coverage**: See which functions were tested
- **Test Results**: Expected vs actual outcomes with transaction hashes
- **Gas Metrics**: Analyze gas consumption across functions
- **Security Findings**: AI-detected vulnerabilities
- **Optimization Tips**: Recommendations to reduce gas costs

### 4. Export & Share

- Download comprehensive reports
- Export test data as CSV/JSON
- Share results via unique URLs

---

## 🏗️ Architecture

```
TestForge/
├── backend/                 # Node.js + Express backend
│   ├── services/
│   │   ├── ai.service.js        # Claude AI integration
│   │   ├── deploy.service.js    # Contract compilation & deployment
│   │   ├── test.service.js      # Comprehensive testing engine
│   │   └── mock.service.js      # Mock token deployment
│   ├── routes/
│   │   └── analyze.js           # API endpoints
│   ├── utils/
│   │   ├── monad.config.js      # Network configuration
│   │   └── scoring.js           # Score calculation
│   └── server.js                # Express + Socket.IO server
│
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContractUpload.jsx
│   │   │   ├── ProgressTracker.jsx
│   │   │   ├── ResultsDashboard.jsx
│   │   │   ├── TestResults.jsx
│   │   │   ├── FunctionCoverage.jsx
│   │   │   ├── GasMetrics.jsx
│   │   │   ├── GasOptimizationTips.jsx
│   │   │   └── SecurityFindings.jsx
│   │   ├── services/
│   │   │   └── api.js               # API client
│   │   └── utils/
│   │       └── constants.js         # Configuration
│   └── index.html
│
└── contracts/               # Sample contracts for testing
```

---

## 🧪 Testing Features

### Function Coverage

- **View Functions**: Read-only contract state
- **Transaction Functions**: State-changing operations
- **Parameterized Functions**: Functions with inputs (automatic test data)
- **Access Control**: Owner vs non-owner testing
- **Edge Cases**: Zero values, max uint256, overflow tests
- **Payable Functions**: ETH/MON transfer testing
- **Token Functions**: ERC20/ERC721 interactions

### Test Data Captured

Each test includes:
```json
{
  "functionName": "increment",
  "type": "transaction",
  "status": "passed",
  "walletType": "owner",
  "parameters": [],
  "expectedResult": "Transaction executed successfully",
  "actualResult": "Transaction confirmed",
  "transactionHash": "0x1234...5678",
  "gasUsed": "43234",
  "blockNumber": 12345678
}
```

---

## 🔐 Security Features

### AI-Powered Detection

- Reentrancy vulnerabilities
- Integer overflow/underflow
- Access control issues
- Unprotected functions
- Gas optimization opportunities

### Severity Levels

- 🔴 **Critical**: Must fix before deployment
- 🟡 **Warning**: Should be addressed
- 🔵 **Info**: Best practices and optimizations

---

## 📊 Example Output

```
=== Analysis Complete ===
Overall Score: 84/100 (Good)
Contract: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1

Test Results:
├── Total: 27 tests
├── Passed: 25 tests
├── Failed: 2 tests
└── Coverage: 100%

Gas Analysis:
├── Total Gas: 1,234,567
├── Average: 45,724 per function
├── Most Expensive: transfer() - 52,341 gas
└── Optimization Score: 85/100

Security Findings:
├── Critical: 0
├── Warnings: 3
└── Info: 5
```

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **Socket.IO** - Real-time communication
- **ethers.js** - Blockchain interactions
- **solc** - Solidity compiler
- **Anthropic Claude API** - AI analysis

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time updates

### Blockchain
- **Monad Testnet** - Deployment network
- **Hardhat** - Development environment

---

## 🎯 Use Cases

### For Developers
- ✅ Test contracts before mainnet deployment
- ✅ Identify gas optimization opportunities
- ✅ Verify function behavior with real blockchain state
- ✅ Ensure access control is properly implemented

### For Auditors
- ✅ Automated security analysis
- ✅ Comprehensive test coverage reports
- ✅ Transaction-level verification
- ✅ Export data for further analysis

### For Projects
- ✅ CI/CD integration for continuous testing
- ✅ Track improvements over multiple versions
- ✅ Team collaboration with shareable results
- ✅ Documentation generation

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Monad** for the amazing blockchain platform
- **Anthropic** for Claude AI
- **OpenZeppelin** for smart contract standards
- **Hardhat** team for development tools

---

## 📧 Contact

**Bilal Karadeniz**
- GitHub: [@bilal07karadeniz](https://github.com/bilal07karadeniz)
- Twitter: [@bilal07kara](https://twitter.com/bilal07kara)

---

## 🚀 Roadmap

- [ ] Multi-chain support (Ethereum, Polygon, etc.)
- [ ] Code generation (Hardhat tests, deployment scripts)
- [ ] Test history and comparison
- [ ] Attack vector simulation
- [ ] Differential testing (compare versions)
- [ ] Interactive test builder
- [ ] Team workspaces
- [ ] CI/CD integration

---

<div align="center">

**Built with ❤️ for the Monad Hackathon**

[Report Bug](https://github.com/bilal07karadeniz/TestForge/issues) · [Request Feature](https://github.com/bilal07karadeniz/TestForge/issues)

</div>
