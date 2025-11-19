import { pgTable, uuid, varchar, text, timestamp, real, jsonb } from 'drizzle-orm/pg-core';

// ============================================================================
// Analyses Table
// ============================================================================

export const analyses = pgTable('analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  cryptocurrency: varchar('cryptocurrency', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // pending, processing, completed, failed
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  error: text('error'),
  metadata: jsonb('metadata'),
});

// ============================================================================
// Agent Messages Table
// ============================================================================

export const agentMessages = pgTable('agent_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisId: uuid('analysis_id').references(() => analyses.id, { onDelete: 'cascade' }).notNull(),
  agentRole: varchar('agent_role', { length: 50 }).notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  metadata: jsonb('metadata'),
});

// ============================================================================
// Reports Table
// ============================================================================

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisId: uuid('analysis_id').references(() => analyses.id, { onDelete: 'cascade' }).notNull(),
  cryptocurrency: varchar('cryptocurrency', { length: 50 }).notNull(),
  summary: text('summary').notNull(),
  technicalAnalysis: jsonb('technical_analysis').notNull(),
  sentimentAnalysis: jsonb('sentiment_analysis').notNull(),
  recommendations: jsonb('recommendations').notNull(),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
});

// ============================================================================
// News Articles Table
// ============================================================================

export const newsArticles = pgTable('news_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  url: text('url'),
  source: varchar('source', { length: 100 }).notNull(),
  publishedAt: timestamp('published_at').notNull(),
  cryptocurrency: varchar('cryptocurrency', { length: 50 }).notNull(),
  sentiment: real('sentiment'), // -1 to 1
  savedAt: timestamp('saved_at').defaultNow().notNull(),
});

// ============================================================================
// Crypto Prices Table
// ============================================================================

export const cryptoPrices = pgTable('crypto_prices', {
  id: uuid('id').primaryKey().defaultRandom(),
  cryptocurrency: varchar('cryptocurrency', { length: 50 }).notNull(),
  price: real('price').notNull(),
  volume: real('volume'),
  marketCap: real('market_cap'),
  priceChange24h: real('price_change_24h'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// ============================================================================
// Type Exports for TypeScript
// ============================================================================

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;

export type AgentMessage = typeof agentMessages.$inferSelect;
export type NewAgentMessage = typeof agentMessages.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

export type NewsArticle = typeof newsArticles.$inferSelect;
export type NewNewsArticle = typeof newsArticles.$inferInsert;

export type CryptoPrice = typeof cryptoPrices.$inferSelect;
export type NewCryptoPrice = typeof cryptoPrices.$inferInsert;
