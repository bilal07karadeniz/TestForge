# 🛠️ TestForge Setup Guide

This guide will help you set up TestForge for local development or deployment.

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn** package manager
- ✅ **Git** for version control
- ✅ **Monad Testnet wallet** with MON tokens
- ✅ **Anthropic API key** ([Get one](https://console.anthropic.com/))

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/bilal07karadeniz/TestForge.git
cd TestForge
```

---

## Step 2: Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:

```env
# Required: Your Monad testnet wallet private key
MONAD_PRIVATE_KEY=0x1234567890abcdef...

# Required: Second wallet for access control testing
MONAD_PRIVATE_KEY_2=0xabcdef1234567890...

# Required: Anthropic API key for AI features
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: Custom RPC URL (default provided)
MONAD_RPC_URL=https://rpc.ankr.com/monad_testnet

# Optional: Server port (default: 3000)
PORT=3000
```

### Get Monad Testnet Tokens

1. Visit [Monad Faucet](https://faucet.monad.xyz/)
2. Enter your wallet address
3. Request testnet MON tokens
4. Wait for confirmation

### Get Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste into `.env`

### Start the Backend

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════╗
║   Monad AI Contract Tester - Backend     ║
╚════════════════════════════════════════════╝

🚀 Server running on http://localhost:3000
🔌 WebSocket ready for real-time updates
🌐 Network: Monad Testnet (Chain ID: 10143)
🤖 AI Model: claude-sonnet-4-5-20250929

Ready to analyze smart contracts! 🎉
```

---

## Step 3: Frontend Setup

Open a **new terminal** window:

### Install Dependencies

```bash
cd frontend
npm install
```

### Configure Environment (Optional)

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` if needed (default works for local development):

```env
VITE_API_URL=http://localhost:3000
```

### Start the Frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the TestForge interface! 🎉

---

## Testing the Setup

### Test with Sample Contract

1. Click **"Paste Code"** tab
2. Paste this simple contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    uint256 public count;

    function increment() public {
        count += 1;
    }

    function getCount() public view returns (uint256) {
        return count;
    }
}
```

3. Click **"Analyze Contract"**
4. Watch the progress tracker
5. View the comprehensive test results!

---

## Troubleshooting

### Backend Issues

**Problem**: `MONAD_PRIVATE_KEY not found`
- ✅ Check `.env` file exists in `/backend`
- ✅ Ensure private key is set correctly
- ✅ Restart the backend server

**Problem**: `Insufficient balance for deployment`
- ✅ Get MON tokens from faucet
- ✅ Verify wallet address has balance
- ✅ Check you're using testnet, not mainnet

**Problem**: `Report generation failed`
- ✅ Check ANTHROPIC_API_KEY is valid
- ✅ Ensure you have API credits
- ✅ Check internet connection

### Frontend Issues

**Problem**: `Failed to fetch`
- ✅ Ensure backend is running on port 3000
- ✅ Check VITE_API_URL in `.env`
- ✅ Verify CORS is enabled

**Problem**: Socket connection failed
- ✅ Backend must be running
- ✅ Check firewall settings
- ✅ Ensure ports 3000 and 5173 are available

### Common Issues

**Problem**: `npm install` fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**Problem**: Port already in use
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change PORT in .env
```

---

## Production Deployment

### Backend Deployment

1. **Deploy to Railway/Render/Heroku**
   - Set environment variables in dashboard
   - Connect GitHub repository
   - Deploy main branch

2. **Configure CORS**
   ```javascript
   // backend/server.js
   app.use(cors({
     origin: ['https://your-frontend-domain.com']
   }));
   ```

### Frontend Deployment

1. **Build for production**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel/Netlify**
   ```bash
   # Vercel
   vercel --prod

   # Netlify
   netlify deploy --prod
   ```

3. **Update environment**
   ```env
   VITE_API_URL=https://your-backend-url.com
   ```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONAD_PRIVATE_KEY` | ✅ Yes | Primary wallet private key |
| `MONAD_PRIVATE_KEY_2` | ✅ Yes | Secondary wallet for testing |
| `ANTHROPIC_API_KEY` | ✅ Yes | Claude AI API key |
| `MONAD_RPC_URL` | ❌ No | Custom RPC URL (default provided) |
| `PORT` | ❌ No | Server port (default: 3000) |
| `NODE_ENV` | ❌ No | Environment (development/production) |

### Frontend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ❌ No | Backend API URL (default: http://localhost:3000) |

---

## Next Steps

- ✅ Read the [README.md](README.md) for feature overview
- ✅ Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- ✅ Try deploying your own contracts
- ✅ Explore gas optimization suggestions
- ✅ Export test results for documentation

---

## Need Help?

- 📧 Open an issue: [GitHub Issues](https://github.com/bilal07karadeniz/TestForge/issues)
- 🐦 Twitter: [@bilal07kara](https://twitter.com/bilal07kara)
- 💬 Join our Discord: [Coming soon]

---

**Happy Testing! 🚀**
