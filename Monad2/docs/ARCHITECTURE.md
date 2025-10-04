# 🏗️ TestForge Architecture

This document describes the technical architecture of TestForge.

---

## System Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │────────▶│   Frontend   │────────▶│   Backend   │
│  (React)    │◀────────│  (Vite)      │◀────────│  (Node.js)  │
└─────────────┘         └──────────────┘         └─────────────┘
                              │                          │
                              │                          │
                        WebSocket                    Monad RPC
                        Connection                       │
                              │                          ▼
                              └──────────────────►┌─────────────┐
                                                  │   Monad     │
                                                  │  Testnet    │
                                                  └─────────────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │  Claude AI  │
                                                  │   (API)     │
                                                  └─────────────┘
```

---

## Backend Architecture

### Core Services

#### 1. **AI Service** (`services/ai.service.js`)
```javascript
// Responsibilities:
- Contract dependency analysis
- Test script generation
- Security report generation
- Integration with Anthropic Claude API

// Key Functions:
- analyzeContractDependencies()
- analyzeContractAndGenerateTests()
- generateSecurityReport()
```

#### 2. **Deploy Service** (`services/deploy.service.js`)
```javascript
// Responsibilities:
- Solidity compilation (solc)
- Contract deployment to Monad
- Artifact management
- Gas estimation

// Key Functions:
- compileContract()
- deployToMonad()
- saveContractArtifacts()
- extractContractName()
```

#### 3. **Test Service** (`services/test.service.js`)
```javascript
// Responsibilities:
- Comprehensive function testing
- Access control verification
- Edge case testing
- Gas analysis

// Key Functions:
- executeContractTests()
- testParameterlessFunctions()
- testAccessControl()
- testParameterizedFunctions()
- testEdgeCases()
- testPayableFunctions()
- testTokenFunctions()
```

#### 4. **Mock Service** (`services/mock.service.js`)
```javascript
// Responsibilities:
- Deploy ERC20 mock tokens
- Deploy ERC721 mock NFTs
- Distribute test tokens
- Constructor parameter generation

// Key Functions:
- setupTestEnvironment()
- deployMockERC20()
- deployMockERC721()
- getConstructorParams()
```

---

## Data Flow

### 1. Contract Upload
```
User uploads .sol file
        ↓
Frontend validates file
        ↓
POST /api/analyze
        ↓
Backend receives file
        ↓
Extract contract code
```

### 2. Analysis Pipeline
```
Step 1: AI Dependency Analysis
   ├─ Detect ERC20/ERC721
   ├─ Identify payable functions
   └─ Determine test strategy
        ↓
Step 2: Mock Deployment (if needed)
   ├─ Deploy ERC20 tokens
   ├─ Deploy ERC721 NFTs
   └─ Distribute to test wallets
        ↓
Step 3: Contract Compilation
   ├─ Compile with solc
   ├─ Extract ABI
   └─ Get bytecode
        ↓
Step 4: Deployment
   ├─ Deploy to Monad
   ├─ Get contract address
   └─ Get transaction hash
        ↓
Step 5: Testing
   ├─ Test view functions
   ├─ Test transactions
   ├─ Test access control
   ├─ Test with parameters
   ├─ Test edge cases
   └─ Collect gas metrics
        ↓
Step 6: AI Reporting
   ├─ Generate security report
   ├─ Calculate scores
   └─ Format findings
        ↓
Step 7: Results
   ├─ Emit via Socket.IO
   └─ Return JSON response
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── ContractUpload
│   ├── File upload
│   └── Code paste
├── ProgressTracker
│   └── Real-time progress
├── ResultsDashboard
│   ├── ScoreCircle
│   ├── FunctionCoverage
│   ├── TestResults
│   │   ├── Export buttons
│   │   └── Test details
│   ├── GasMetrics
│   ├── SecurityFindings
│   └── GasOptimizationTips
```

### State Management

```javascript
// Global State (App.jsx)
const [stage, setStage] = useState('upload');
const [currentStep, setCurrentStep] = useState('analyzing');
const [testProgress, setTestProgress] = useState(null);
const [results, setResults] = useState(null);

// Socket.IO Events
socket.on('progress', (data) => { /* Update progress */ });
socket.on('complete', (data) => { /* Show results */ });
socket.on('error', (error) => { /* Handle error */ });
```

---

## Database Schema

### Test Results Structure

```json
{
  "score": 84,
  "deployment": {
    "contractName": "Counter",
    "address": "0x742d35...",
    "transactionHash": "0x1234...",
    "timestamp": "2025-01-04T10:30:00Z"
  },
  "testResults": {
    "total": 27,
    "passed": 25,
    "failed": 2,
    "tests": [
      {
        "functionName": "increment",
        "type": "transaction",
        "status": "passed",
        "walletType": "owner",
        "parameters": [],
        "expectedResult": "Transaction executed successfully",
        "actualResult": "Transaction confirmed",
        "transactionHash": "0x5678...",
        "gasUsed": "43234",
        "blockNumber": 12345678
      }
    ]
  },
  "findings": {
    "critical": [],
    "warnings": [
      {
        "title": "Missing access control",
        "description": "...",
        "remediation": "..."
      }
    ],
    "info": []
  },
  "gasMetrics": {
    "totalGas": 1234567,
    "averageGas": 45724,
    "mostExpensive": {
      "name": "transfer",
      "gas": "52341"
    },
    "optimizationScore": 85,
    "transactions": []
  },
  "mocks": {
    "token": {
      "name": "MockERC20",
      "address": "0xabcd..."
    }
  },
  "aiReport": "Detailed analysis..."
}
```

---

## API Endpoints

### POST /api/analyze

**Request:**
```javascript
// File upload
FormData {
  contract: File (.sol)
}

// OR Code paste
{
  contractCode: "pragma solidity ^0.8.0; ..."
}
```

**Response:**
```json
{
  "success": true,
  "contractName": "Counter",
  "report": {
    "score": 84,
    "severity": "Good",
    "critical": [],
    "warnings": [],
    "info": [],
    "analysis": "..."
  },
  "testScript": "...",
  "aiUsage": {
    "total_input_tokens": 1313,
    "total_output_tokens": 3450
  }
}
```

### GET /api/health

**Response:**
```json
{
  "status": "ok",
  "service": "Monad Contract Tester",
  "timestamp": "2025-01-04T10:30:00.000Z"
}
```

---

## WebSocket Events

### Client → Server
```javascript
// Auto-connected, no events sent from client
```

### Server → Client

#### progress
```json
{
  "step": "testing",
  "message": "Running tests",
  "testProgress": {
    "current": 15,
    "total": 27
  }
}
```

#### complete
```json
{
  "score": 84,
  "deployment": { ... },
  "testResults": { ... },
  "findings": { ... },
  "gasMetrics": { ... },
  "mocks": { ... },
  "aiReport": "..."
}
```

#### error
```json
{
  "message": "Deployment failed: ...",
  "step": "deploying"
}
```

---

## Security Considerations

### Private Key Management
```javascript
// ✅ Stored in .env (never committed)
// ✅ Loaded via dotenv
// ✅ Never exposed in responses
// ✅ Used only in backend
```

### API Security
```javascript
// ✅ CORS enabled for specific origins
// ✅ Rate limiting (future)
// ✅ Input validation
// ✅ Error handling without sensitive data
```

### Smart Contract Testing
```javascript
// ✅ Isolated test wallets
// ✅ Testnet only (no mainnet)
// ✅ Gas limit restrictions
// ✅ Automatic cleanup
```

---

## Performance Optimization

### Frontend
- ✅ Code splitting with React lazy
- ✅ Memoization with useMemo/useCallback
- ✅ Framer Motion animations
- ✅ Virtualized lists for long test results

### Backend
- ✅ Socket.IO for real-time updates
- ✅ Async/await for non-blocking operations
- ✅ Promise.all for parallel execution
- ✅ Efficient gas estimation

---

## Testing Strategy

### Unit Tests (Future)
```javascript
// Backend
- Service functions
- Utility functions
- API endpoints

// Frontend
- Component rendering
- User interactions
- State management
```

### Integration Tests (Future)
```javascript
// End-to-end testing
- Contract upload → Results
- WebSocket communication
- Error handling
```

---

## Deployment Architecture

### Development
```
localhost:3000 (Backend)
localhost:5173 (Frontend)
```

### Production
```
Backend: Railway/Render/Heroku
Frontend: Vercel/Netlify
Database: MongoDB/PostgreSQL (future)
```

---

## Future Enhancements

### Scalability
- [ ] Database for test history
- [ ] Redis for caching
- [ ] Queue system for concurrent tests
- [ ] Load balancing

### Features
- [ ] Multi-chain support
- [ ] Code generation
- [ ] CI/CD integration
- [ ] Team workspaces

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI framework |
| Build Tool | Vite | Fast development |
| Styling | Tailwind CSS | Utility-first CSS |
| Animation | Framer Motion | Smooth transitions |
| Backend | Node.js + Express | Server framework |
| Real-time | Socket.IO | WebSocket communication |
| Blockchain | ethers.js v6 | Smart contract interaction |
| Compiler | solc-js | Solidity compilation |
| AI | Anthropic Claude | Contract analysis |
| Network | Monad Testnet | Blockchain deployment |

---

**For questions or suggestions, open an issue on GitHub!**
