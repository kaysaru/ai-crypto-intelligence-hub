# Crypto Intelligence Hub 🪙

Multi-agent cryptocurrency analysis platform using RAG (Retrieval-Augmented Generation) and LangGraph orchestration.

## Features

- 🤖 **Multi-Agent System**: 6 specialized AI agents working together
- 🔍 **RAG Implementation**: Semantic search with ChromaDB
- 📊 **Technical Analysis**: Vision models analyze charts
- 💭 **Sentiment Analysis**: Social media and news sentiment
- ⚡ **Real-time Updates**: WebSocket-based agent communication
- 🎨 **Modern UI**: React with shadcn/ui components

## Architecture

```
├── Frontend: React + TypeScript + shadcn/ui
├── Backend: Express + tRPC + Socket.io
├── Orchestration: LangGraph
├── LLM: Ollama (local models)
├── Databases: PostgreSQL + ChromaDB
└── Agent System: 6 specialized agents
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Ollama** ([Download](https://ollama.ai))

## Quick Start

### 1. Install Ollama Models

```bash
# Main language model (4.7GB)
ollama pull llama3.1:8b

# Vision model for chart analysis (7.9GB)
ollama pull llama3.2-vision:11b

# Embedding model for RAG (274MB)
ollama pull nomic-embed-text
```

### 2. Start Databases

```bash
# Start PostgreSQL and ChromaDB
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Install Dependencies

```bash
# Install all packages
pnpm install
```

### 4. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env if needed (default values work for local development)
```

### 5. Setup Database

```bash
# Run migrations
pnpm db:migrate

# (Optional) Seed with sample data
pnpm db:seed
```

### 6. Start Development

```bash
# Start all services (frontend + backend)
pnpm dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: postgresql://localhost:5432
- **ChromaDB**: http://localhost:8000

## Project Structure

```
crypto-intelligence-hub/
├── packages/
│   ├── frontend/              # React application
│   │   ├── src/
│   │   │   ├── pages/         # Dashboard, Agent Chat, Reports
│   │   │   ├── components/    # UI components
│   │   │   └── lib/           # tRPC client, utilities
│   │   └── package.json
│   │
│   ├── backend/               # Express server
│   │   ├── src/
│   │   │   ├── agents/        # AI agent implementations
│   │   │   ├── langgraph/     # Workflow orchestration
│   │   │   ├── services/      # External API services
│   │   │   ├── trpc/          # API routes
│   │   │   ├── websocket/     # Real-time communication
│   │   │   └── db/            # Database schema & migrations
│   │   └── package.json
│   │
│   └── shared/                # Shared TypeScript types
│       └── src/types.ts
│
├── docker-compose.yml         # Database services
├── pnpm-workspace.yaml        # Monorepo configuration
└── README.md
```

## Agents

The system consists of 6 specialized agents:

1. **Coordinator Agent** - Orchestrates the workflow
2. **News Collector Agent** - Fetches and filters crypto news
3. **Sentiment Analyzer Agent** - Analyzes market sentiment
4. **Technical Analyst Agent** - Analyzes charts with vision models
5. **Report Writer Agent** - Generates comprehensive reports
6. **Critic Agent** - Reviews and validates conclusions

## RAG Pipeline

The RAG implementation enables semantic search across crypto news:

1. News articles are embedded using `nomic-embed-text`
2. Embeddings stored in ChromaDB vector database
3. Semantic search retrieves relevant context
4. Context augments LLM prompts for better analysis

## Development

### Available Scripts

```bash
pnpm dev          # Start all services in development mode
pnpm build        # Build all packages
pnpm clean        # Clean all build artifacts
pnpm db:migrate   # Run database migrations
pnpm db:seed      # Seed database with sample data
pnpm db:studio    # Open Drizzle Studio (database GUI)
```

### Environment Variables

See `.env.example` for all available configuration options.

### Database Management

```bash
# View database with Drizzle Studio
pnpm db:studio

# Create new migration
cd packages/backend
pnpm db:generate

# Reset database
docker-compose down -v
docker-compose up -d
pnpm db:migrate
```

## API Documentation

### tRPC Routes

- `analysis.create` - Start new crypto analysis
- `analysis.getById` - Get analysis details
- `analysis.list` - List all analyses
- `reports.getById` - Get report by ID
- `news.search` - Semantic search for news

### WebSocket Events

- `analysis:started` - Analysis workflow begins
- `agent:message` - Agent sends message
- `workflow:status` - Workflow progress update
- `analysis:completed` - Analysis finished

## Troubleshooting

### Ollama Connection Issues

```bash
# Check Ollama status
ollama list

# Restart Ollama service
# macOS/Linux: System settings or `ollama serve`
```

### Database Connection

```bash
# Check Docker services
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs chromadb

# Restart services
docker-compose restart
```

### Port Conflicts

If ports 3000, 3001, 5432, or 8000 are in use, update them in:
- `docker-compose.yml`
- `.env`
- `packages/frontend/vite.config.ts`
- `packages/backend/src/index.ts`

## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express, tRPC, Socket.io
- **AI/ML**: Ollama, LangChain, LangGraph
- **Database**: PostgreSQL (Drizzle ORM), ChromaDB
- **Build Tools**: Vite, pnpm workspaces

## License

MIT License - Educational project for AI course

## Author

Student project for CSE7912: Intelligent Application Development
