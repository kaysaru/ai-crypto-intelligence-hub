import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './lib/trpc';

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3001/trpc',
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-foreground">
          {/* Header */}
          <header className="border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🪙</span>
                  <h1 className="text-xl font-bold">Crypto Intelligence Hub</h1>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Multi-Agent Analysis Platform
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Welcome to Crypto Intelligence Hub
                </h2>
                <p className="text-muted-foreground mb-6">
                  AI-powered cryptocurrency analysis with multi-agent system and RAG
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-2xl mb-2">🤖</div>
                    <h3 className="font-semibold mb-1">6 AI Agents</h3>
                    <p className="text-sm text-muted-foreground">
                      Specialized agents working together
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-2xl mb-2">🔍</div>
                    <h3 className="font-semibold mb-1">RAG Pipeline</h3>
                    <p className="text-sm text-muted-foreground">
                      Semantic search with ChromaDB
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-2xl mb-2">📊</div>
                    <h3 className="font-semibold mb-1">Real-time Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Live updates via WebSocket
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary-foreground/80">
                    🚧 <strong>Development in Progress</strong> - UI components coming soon!
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-border mt-16">
            <div className="container mx-auto px-4 py-6">
              <p className="text-center text-sm text-muted-foreground">
                Built with React, tRPC, LangGraph, and Ollama
              </p>
            </div>
          </footer>
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
