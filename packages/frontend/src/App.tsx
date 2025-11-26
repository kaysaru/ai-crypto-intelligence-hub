import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './lib/trpc';
import { io, Socket } from 'socket.io-client';
import ReactMarkdown from 'react-markdown';

function AppContent() {
  const [crypto, setCrypto] = useState('BTC');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [agentMessages, setAgentMessages] = useState<any[]>([]);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  const createAnalysis = trpc.analysis.create.useMutation();
  const { data: analyses } = trpc.analysis.list.useQuery();
  const { data: currentAnalysis } = trpc.analysis.getById.useQuery(
    { id: currentAnalysisId! },
    { enabled: !!currentAnalysisId, refetchInterval: 2000 }
  );
  const { data: report } = trpc.reports.getByAnalysisId.useQuery(
    { analysisId: currentAnalysisId! },
    { enabled: !!currentAnalysisId && currentAnalysis?.status === 'completed' }
  );

  // WebSocket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3002');
    setSocket(newSocket);

    newSocket.on('agent:message', (data: any) => {
      console.log('Agent message:', data);
      setAgentMessages((prev) => [...prev, data]);
    });

    newSocket.on('analysis:completed', (data: any) => {
      console.log('Analysis completed:', data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleAnalyze = async () => {
    try {
      setAgentMessages([]);
      const result = await createAnalysis.mutateAsync({
        cryptocurrency: crypto,
      });
      setCurrentAnalysisId(result.id);
    } catch (error) {
      console.error('Failed to create analysis:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <h1 className="text-xl font-bold">Crypto Intelligence Hub</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Analysis Controls */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🚀 Start Analysis</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Cryptocurrency
              </label>
              <select
                value={crypto}
                onChange={(e) => setCrypto(e.target.value)}
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg"
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="XRP">Ripple (XRP)</option>
              </select>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={createAnalysis.isLoading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {createAnalysis.isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Messages */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">🤖 Agent Activity</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {agentMessages.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No agent activity yet. Start an analysis to see agents in action!
                </p>
              ) : (
                agentMessages.map((msg, i) => (
                  <div key={i} className="bg-muted/50 rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-primary">
                        {msg.agentRole}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current Analysis Status */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">📊 Analysis Status</h2>
            {currentAnalysis ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">ID:</span>
                  <p className="text-xs font-mono">{currentAnalysis.id}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Crypto:</span>
                  <p className="font-medium">{currentAnalysis.cryptocurrency}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{currentAnalysis.status}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Messages:</span>
                  <p className="font-medium">{currentAnalysis.messages?.length || 0}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No active analysis
              </p>
            )}
          </div>
        </div>

        {/* Report Viewer */}
        {report && (
          <div className="bg-card border border-border rounded-lg p-6 mt-6">
            <h2 className="text-lg font-bold mb-4">📄 Analysis Report</h2>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded p-4">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm">{report.summary}</p>
              </div>
              
              <div className="bg-muted/50 rounded p-4">
                <h3 className="font-semibold mb-2">Sentiment Analysis</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Overall:</strong> {report.sentimentAnalysis?.overallSentiment || 'N/A'}</p>
                  <p><strong>Fear/Greed:</strong> {report.sentimentAnalysis?.fearGreedIndex || 'N/A'}/100</p>
                  <p><strong>Confidence:</strong> {report.sentimentAnalysis?.confidence || 'N/A'}%</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded p-4">
                <h3 className="font-semibold mb-2">Recommendation</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Action:</strong> {report.recommendations?.action?.toUpperCase() || 'N/A'}</p>
                  <p><strong>Risk Level:</strong> {report.recommendations?.riskLevel || 'N/A'}</p>
                  <div className="mt-2 p-3 bg-background rounded">
                    <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-primary" {...props} />,
                          code: ({ node, ...props }) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props} />,
                          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />,
                        }}
                    >
                      {report.recommendations?.reasoning}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Analyses */}
        <div className="bg-card border border-border rounded-lg p-6 mt-6">
          <h2 className="text-lg font-bold mb-4">📋 Recent Analyses</h2>
          <div className="space-y-2">
            {analyses && analyses.length > 0 ? (
              analyses.slice(0, 5).map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded cursor-pointer hover:bg-muted"
                  onClick={() => setCurrentAnalysisId(analysis.id)}
                >
                  <div>
                    <span className="font-medium">{analysis.cryptocurrency}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(analysis.startedAt).toLocaleString()}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      analysis.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : analysis.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {analysis.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No analyses yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3002/trpc',
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
