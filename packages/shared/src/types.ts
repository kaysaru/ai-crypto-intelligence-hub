import { z } from 'zod';

// ============================================================================
// Agent Types
// ============================================================================

export type AgentRole = 
  | 'coordinator'
  | 'news-collector'
  | 'sentiment-analyzer'
  | 'technical-analyst'
  | 'report-writer'
  | 'critic';

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'done' | 'error';

export interface AgentMessage {
  id: string;
  agentRole: AgentRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Analysis Types
// ============================================================================

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Analysis {
  id: string;
  cryptocurrency: string;
  status: AnalysisStatus;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

// ============================================================================
// Report Types
// ============================================================================

export interface TechnicalAnalysis {
  price: number;
  priceChange24h: number;
  volume: number;
  marketCap: number;
  indicators: {
    rsi?: number;
    macd?: string;
    support?: number;
    resistance?: number;
  };
  chartAnalysis?: string;
}

export interface SentimentAnalysis {
  fearGreedIndex: number; // 0-100
  socialSentiment: {
    twitter?: {
      bullish: number;
      bearish: number;
      neutral: number;
    };
    reddit?: {
      bullish: number;
      bearish: number;
      neutral: number;
    };
  };
  newsHeadlines: string[];
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface Recommendations {
  action: 'buy' | 'sell' | 'hold';
  riskLevel: 'low' | 'medium' | 'high';
  targetPrice?: number;
  stopLoss?: number;
  timeHorizon: 'short' | 'medium' | 'long';
  reasoning: string;
}

export interface Report {
  id: string;
  analysisId: string;
  cryptocurrency: string;
  summary: string;
  technicalAnalysis: TechnicalAnalysis;
  sentimentAnalysis: SentimentAnalysis;
  recommendations: Recommendations;
  generatedAt: Date;
}

// ============================================================================
// News Types
// ============================================================================

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  url?: string;
  source: string;
  publishedAt: Date;
  cryptocurrency: string;
  sentiment?: number; // -1 to 1
}

// ============================================================================
// Crypto Price Types
// ============================================================================

export interface CryptoPrice {
  id: string;
  cryptocurrency: string;
  price: number;
  volume: number;
  marketCap: number;
  timestamp: Date;
}

// ============================================================================
// WebSocket Event Types
// ============================================================================

export interface WebSocketEvents {
  // Server -> Client
  'analysis:started': { analysisId: string };
  'analysis:completed': { analysisId: string; reportId: string };
  'analysis:failed': { analysisId: string; error: string };
  'agent:message': AgentMessage & { analysisId: string };
  'workflow:status': {
    analysisId: string;
    currentNode: string;
    progress: number;
    completedAgents: AgentRole[];
  };
  
  // Client -> Server
  'subscribe:analysis': { analysisId: string };
  'unsubscribe:analysis': { analysisId: string };
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const createAnalysisSchema = z.object({
  cryptocurrency: z.string().min(1).max(50),
  newsSources: z.array(z.string()).optional(),
});

export const agentMessageSchema = z.object({
  agentRole: z.enum([
    'coordinator',
    'news-collector',
    'sentiment-analyzer',
    'technical-analyst',
    'report-writer',
    'critic',
  ]),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export const newsSearchSchema = z.object({
  query: z.string(),
  limit: z.number().min(1).max(50).default(10),
  cryptocurrency: z.string().optional(),
});

// ============================================================================
// Export Types
// ============================================================================

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;
export type NewsSearchInput = z.infer<typeof newsSearchSchema>;
