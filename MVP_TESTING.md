# MVP Testing Guide - 3 Hour Demo 🚀

## Quick Start (5 minutes)

### 1. Start Services

```bash
# Terminal 1: Start Databases (if not already running)
docker-compose up -d

# Verify they're running
docker-compose ps

# Expected: Both postgres and chromadb should be "Up"
```

### 2. Run Migrations

```bash
# Create database tables
pnpm db:migrate
```

### 3. Start Application

```bash
# Start both frontend and backend
pnpm dev
```

Wait for both servers to start:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

## Testing the MVP (10 minutes)

### Test 1: Basic Analysis

1. Open browser: http://localhost:3000
2. Select "Bitcoin (BTC)" from dropdown
3. Click "Analyze" button
4. Watch in **real-time**:
   - **Agent Activity** panel shows 3 agents working
   - **Analysis Status** shows progress
5. Wait ~30-60 seconds for completion
6. Check backend terminal for detailed logs

### Test 2: View Results

1. Check "Recent Analyses" section
2. Click on completed analysis
3. Verify status changed to "completed"
4. See agent messages in database:

```bash
# Optional: View in database
pnpm db:studio
# Then browse: agentMessages, reports tables
```

### Test 3: Try Different Crypto

1. Select "Ethereum (ETH)"
2. Click "Analyze"
3. Watch new analysis run
4. Compare with previous BTC analysis

## What to Show in Demo 🎯

### 1. Multi-Agent System
✅ **3 agents working sequentially:**
- News Collector (fetches from CryptoPanic API)
- Sentiment Analyzer (uses RAG + LLM)
- Report Writer (generates final report)

### 2. RAG Implementation
✅ **See it in action:**
- News stored in ChromaDB with embeddings
- Sentiment agent retrieves relevant news via semantic search
- Context augmentation visible in logs

### 3. Real-time Updates
✅ **WebSocket in action:**
- Agent messages appear live in UI
- Status updates in real-time
- No page refresh needed

### 4. LLM Integration
✅ **Ollama qwen3:14b:**
- News summarization
- Sentiment analysis with structured output
- Report generation

## Backend Terminal Output

You should see logs like this:

```
🚀 Starting analysis workflow for BTC
Analysis ID: abc-123-def

📰 Step 1/3: News Collection
[NEWS-COLLECTOR] Starting news collection for BTC...
[NEWS-COLLECTOR] Fetched 15 news articles
✅ Added 15 news articles to vector DB

😊 Step 2/3: Sentiment Analysis
[SENTIMENT-ANALYZER] Analyzing sentiment for BTC...
[SENTIMENT-ANALYZER] Retrieved 10 relevant articles via RAG
Sentiment: BULLISH | Fear/Greed: 65/100

✍️  Step 3/3: Report Generation
[REPORT-WRITER] Writing report for BTC...
[REPORT-WRITER] Report generation completed

✅ Analysis completed successfully!
Report ID: xyz-789-abc
```

## Architecture Overview (for Demo)

```
User clicks "Analyze BTC"
    ↓
Frontend (React + tRPC)
    ↓
Backend tRPC Router
    ↓
AnalysisWorkflow starts
    ↓
┌─────────────────────────────────┐
│  Agent 1: News Collector        │
│  - Fetch from CryptoPanic API   │
│  - Generate embeddings (Ollama) │
│  - Store in ChromaDB            │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Agent 2: Sentiment Analyzer    │
│  - RAG: Query ChromaDB          │
│  - Analyze with qwen3:14b       │
│  - Extract sentiment data       │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Agent 3: Report Writer         │
│  - Combine all data             │
│  - Generate report (qwen3:14b)  │
│  - Save to PostgreSQL           │
└─────────────────────────────────┘
    ↓
WebSocket → Frontend updates live
```

## Troubleshooting

### Issue: "Connection refused" to Ollama
```bash
# Check Ollama is running
ollama list

# If not running, start it
ollama serve
```

### Issue: ChromaDB connection failed
```bash
# Check Docker is running
docker-compose ps

# If down, restart
docker-compose up -d
```

### Issue: Analysis stuck at "processing"
```bash
# Check backend logs for errors
# Look in terminal where `pnpm dev` is running
# Common issue: Ollama model not loaded

# Load model manually:
ollama pull qwen3:14b
```

### Issue: No news articles returned
- API key might be invalid
- Check `.env` file has CRYPTOPANIC_API_KEY
- Try different cryptocurrency (ETH, SOL)

## Performance Notes

**Expected timing with qwen3:14b:**
- News Collection: ~5-10 seconds
- Sentiment Analysis: ~15-20 seconds
- Report Writing: ~15-20 seconds
- **Total: ~40-50 seconds per analysis**

## Features Demonstrated ✅

### Course Requirements (Weeks 9-15):

✅ **Week 6: RAG**
- ChromaDB vector database
- Semantic search with embeddings
- Context augmentation

✅ **Week 11-12: Multi-Agent Systems**
- 3 specialized agents
- Sequential workflow
- Agent orchestration
- State management

✅ **Week 9: LLM Integration**
- Ollama local models (qwen3:14b)
- Chat completions
- Embeddings generation

✅ **Week 12: Real-time Communication**
- WebSocket updates
- Live agent messages

✅ **Week 13: Modern Stack**
- TypeScript throughout
- React + tRPC (type-safe)
- PostgreSQL + ChromaDB
- Docker containerization

## What's Working 🎉

1. ✅ Full end-to-end pipeline
2. ✅ Real API integration (CryptoPanic)
3. ✅ Local LLM (Ollama)
4. ✅ Vector database (ChromaDB)
5. ✅ Multi-agent workflow
6. ✅ Real-time updates
7. ✅ Data persistence (PostgreSQL)
8. ✅ Type-safe API (tRPC)

## Quick Demo Script (3 minutes)

1. **Show Architecture** (30 sec)
   - Explain 3 agents, RAG, LLM

2. **Run Analysis** (1 min)
   - Click "Analyze BTC"
   - Show agent activity in real-time
   - Point out WebSocket updates

3. **Show RAG in Backend Logs** (30 sec)
   - Point to "Retrieved X relevant articles via RAG"
   - Explain semantic search

4. **Show Results** (1 min)
   - Status completed
   - Agent messages saved
   - Report in database

## Next Steps (Post-Demo)

If you have more time:
- Add report viewer page
- Add more cryptocurrencies
- Enhance UI with charts
- Add error handling UI
- Deploy to cloud

---

**MVP Complete!** 🎉
Ready for 3-hour deadline demo!
