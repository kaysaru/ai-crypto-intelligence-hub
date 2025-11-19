# Crypto Intelligence Hub - Setup Guide 🚀

This guide will help you get the Crypto Intelligence Hub up and running on your local machine.

## Prerequisites

Make sure you have the following installed:

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **pnpm** (v8 or higher)
   ```bash
   npm install -g pnpm
   pnpm --version  # Should be v8+
   ```

3. **Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker is running

4. **Ollama**
   - Download from: https://ollama.ai
   - Install and make sure it's running

## Step-by-Step Setup

### 1. Install Ollama Models

Open a terminal and pull the required models:

```bash
# Main language model (4.7GB) - This will take a few minutes
ollama pull llama3.1:8b

# Vision model for chart analysis (7.9GB) - Optional for now
ollama pull llama3.2-vision:11b

# Embedding model for RAG (274MB)
ollama pull nomic-embed-text
```

To verify models are installed:
```bash
ollama list
```

### 2. Start Database Services

Start PostgreSQL and ChromaDB using Docker Compose:

```bash
# Start services
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output: Both postgres and chromadb should be "Up"
```

To check logs if there are issues:
```bash
docker-compose logs postgres
docker-compose logs chromadb
```

### 3. Install Dependencies

Install all project dependencies:

```bash
pnpm install
```

This will install dependencies for all packages (shared, backend, frontend).

### 4. Setup Environment Variables

Copy the environment template:

```bash
cp .env.example .env
```

The default values in `.env` work for local development. You don't need to change anything unless:
- Your ports are already in use
- You want to use OpenAI instead of Ollama

### 5. Setup Database

Generate and run migrations:

```bash
# Generate migration files (first time only)
cd packages/backend
pnpm db:generate

# Run migrations to create tables
cd ../..
pnpm db:migrate
```

(Optional) Seed the database with sample data:

```bash
pnpm db:seed
```

### 6. Start Development Servers

Start both frontend and backend:

```bash
pnpm dev
```

This command runs both services concurrently:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000

Wait a few seconds for both servers to start, then open your browser.

### 7. Verify Installation

Open your browser and navigate to:
- **Frontend**: http://localhost:3000

You should see the Crypto Intelligence Hub welcome page.

To test the backend API:
- **Health Check**: http://localhost:3001/health

## Troubleshooting

### Port Already in Use

If you see port conflict errors:

1. **Check what's using the port**:
   ```bash
   # macOS/Linux
   lsof -i :3000  # or :3001, :5432, :8000
   
   # Or kill the process
   kill -9 <PID>
   ```

2. **Change ports**:
   - Update `docker-compose.yml` for database ports
   - Update `.env` for backend/frontend ports
   - Update `packages/frontend/vite.config.ts` for frontend port

### Ollama Connection Issues

If backend can't connect to Ollama:

1. **Verify Ollama is running**:
   ```bash
   ollama list
   ```

2. **Check Ollama service** (macOS/Linux):
   ```bash
   # It should be running at localhost:11434
   curl http://localhost:11434/api/tags
   ```

3. **Restart Ollama**:
   - macOS: Restart from menu bar
   - Linux: `ollama serve`

### Database Connection Issues

If you see database connection errors:

1. **Check Docker containers**:
   ```bash
   docker-compose ps
   docker-compose logs postgres
   ```

2. **Restart containers**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. **Reset database** (if needed):
   ```bash
   docker-compose down -v  # -v removes volumes
   docker-compose up -d
   pnpm db:migrate
   ```

### Installation Issues

If `pnpm install` fails:

1. **Clear cache**:
   ```bash
   pnpm store prune
   ```

2. **Remove node_modules**:
   ```bash
   rm -rf node_modules packages/*/node_modules
   pnpm install
   ```

### Build Errors

If TypeScript compilation fails:

1. **Clean build**:
   ```bash
   pnpm clean
   pnpm install
   ```

2. **Check TypeScript version**:
   ```bash
   pnpm ls typescript
   ```

## Development Workflow

### Running Individual Services

```bash
# Backend only
cd packages/backend
pnpm dev

# Frontend only
cd packages/frontend
pnpm dev
```

### Database Management

```bash
# Open Drizzle Studio (database GUI)
pnpm db:studio

# Create new migration (after changing schema)
cd packages/backend
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed
```

### Useful Commands

```bash
# Install dependency in specific package
pnpm --filter @crypto-intel/backend add <package>

# Run command in all packages
pnpm -r <command>

# Build all packages
pnpm build

# Clean all build artifacts
pnpm clean
```

## Next Steps

Once everything is running:

1. ✅ Verify the frontend loads at http://localhost:3000
2. ✅ Check backend health at http://localhost:3001/health
3. ✅ Explore the database with `pnpm db:studio`
4. 🚧 Start implementing agent system (next phase)
5. 🚧 Build out UI components
6. 🚧 Integrate RAG pipeline

## Project Structure

```
crypto-intelligence-hub/
├── packages/
│   ├── frontend/          # React + Vite + shadcn/ui
│   ├── backend/           # Express + tRPC + LangGraph
│   └── shared/            # Shared TypeScript types
├── docker-compose.yml     # PostgreSQL + ChromaDB
├── pnpm-workspace.yaml    # Monorepo config
└── README.md             # Full documentation
```

## Getting Help

If you encounter issues:

1. Check the main README.md for detailed documentation
2. Review error messages carefully
3. Check Docker and Ollama logs
4. Ensure all prerequisites are installed correctly

## Success! ✨

If you see the welcome page with the 3 feature cards (6 AI Agents, RAG Pipeline, Real-time Analysis), your setup is complete!

The foundation is ready for building the multi-agent system.
