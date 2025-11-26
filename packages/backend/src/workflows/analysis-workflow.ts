import { NewsCollectorAgent } from '../agents/news-collector.agent';
import { SentimentAnalyzerAgent } from '../agents/sentiment-analyzer.agent';
import { ReportWriterAgent } from '../agents/report-writer.agent';
import { AgentContext, AgentResult } from '../agents/base-agent';
import { db, analyses, agentMessages, reports } from '../db';
import { vectorService } from '../services/vector.service';
import { Server as SocketIOServer } from 'socket.io';
import { eq } from 'drizzle-orm';

interface WorkflowResult {
  success: boolean;
  analysisId: string;
  reportId?: string;
  error?: string;
}

export class AnalysisWorkflow {
  private newsCollector: NewsCollectorAgent;
  private sentimentAnalyzer: SentimentAnalyzerAgent;
  private reportWriter: ReportWriterAgent;
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.newsCollector = new NewsCollectorAgent();
    this.sentimentAnalyzer = new SentimentAnalyzerAgent();
    this.reportWriter = new ReportWriterAgent();
    this.io = io;
  }

  /**
   * Execute the complete analysis workflow
   */
  async execute(analysisId: string, cryptocurrency: string): Promise<WorkflowResult> {
    console.log(`\n🚀 Starting analysis workflow for ${cryptocurrency}`);
    console.log(`Analysis ID: ${analysisId}\n`);

    try {
      // Initialize context
      const context: AgentContext = {
        analysisId,
        cryptocurrency,
      };

      // Update analysis status
      await db
        .update(analyses)
        .set({ status: 'processing' })
        .where(eq(analyses.id, analysisId));

      // Initialize vector service
      await vectorService.initialize();

      // Step 1: News Collection
      console.log('📰 Step 1/3: News Collection');
      this.emitAgentStatus(analysisId, 'news-collector', 'working');
      
      const newsResult = await this.newsCollector.execute(context);
      await this.saveAgentMessage(analysisId, 'news-collector', newsResult);
      
      if (!newsResult.success) {
        throw new Error(`News collection failed: ${newsResult.error}`);
      }

      context.newsData = newsResult.data;
      this.emitAgentStatus(analysisId, 'news-collector', 'done');

      // Step 2: Sentiment Analysis
      console.log('\n😊 Step 2/3: Sentiment Analysis');
      this.emitAgentStatus(analysisId, 'sentiment-analyzer', 'working');
      
      const sentimentResult = await this.sentimentAnalyzer.execute(context);
      await this.saveAgentMessage(analysisId, 'sentiment-analyzer', sentimentResult);
      
      if (!sentimentResult.success) {
        throw new Error(`Sentiment analysis failed: ${sentimentResult.error}`);
      }

      context.sentimentData = sentimentResult.data;
      this.emitAgentStatus(analysisId, 'sentiment-analyzer', 'done');

      // Step 3: Report Writing
      console.log('\n✍️  Step 3/3: Report Generation');
      this.emitAgentStatus(analysisId, 'report-writer', 'working');
      
      const reportResult = await this.reportWriter.execute(context);
      await this.saveAgentMessage(analysisId, 'report-writer', reportResult);
      
      if (!reportResult.success) {
        throw new Error(`Report generation failed: ${reportResult.error}`);
      }

      this.emitAgentStatus(analysisId, 'report-writer', 'done');

      // Save final report to database
      const [report] = await db
        .insert(reports)
        .values({
          analysisId,
          cryptocurrency: cryptocurrency.toUpperCase(),
          summary: reportResult.data.report.substring(0, 500) + '...',
          technicalAnalysis: {
            newsCount: newsResult.data.newsCount,
          },
          sentimentAnalysis: {
            overallSentiment: sentimentResult.data.overallSentiment,
            fearGreedIndex: sentimentResult.data.fearGreedIndex,
            confidence: sentimentResult.data.confidence,
            bullishPoints: sentimentResult.data.bullishPoints || [],
            bearishPoints: sentimentResult.data.bearishPoints || [],
            newsHeadlines: newsResult.data.news?.slice(0, 5).map((n: any) => n.title) || [],
          },
          recommendations: {
            action: sentimentResult.data.overallSentiment === 'bullish' ? 'buy' : 
                    sentimentResult.data.overallSentiment === 'bearish' ? 'sell' : 'hold',
            riskLevel: sentimentResult.data.fearGreedIndex < 30 ? 'high' :
                      sentimentResult.data.fearGreedIndex > 70 ? 'high' : 'medium',
            reasoning: reportResult.data.report,
            timeHorizon: 'medium',
          },
        })
        .returning();

      // Update analysis status to completed
      await db
        .update(analyses)
        .set({
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(analyses.id, analysisId));

      // Emit completion event
      this.io.emit('analysis:completed', {
        analysisId,
        reportId: report.id,
      });

      console.log(`\n✅ Analysis completed successfully!`);
      console.log(`Report ID: ${report.id}\n`);

      return {
        success: true,
        analysisId,
        reportId: report.id,
      };
    } catch (error: any) {
      console.error('\n❌ Workflow failed:', error.message);

      // Update analysis status to failed
      await db
        .update(analyses)
        .set({
          status: 'failed',
          error: error.message,
          completedAt: new Date(),
        })
        .where(eq(analyses.id, analysisId));

      // Emit failure event
      this.io.emit('analysis:failed', {
        analysisId,
        error: error.message,
      });

      return {
        success: false,
        analysisId,
        error: error.message,
      };
    }
  }

  /**
   * Save agent message to database
   */
  private async saveAgentMessage(
    analysisId: string,
    agentRole: string,
    result: AgentResult
  ): Promise<void> {
    await db.insert(agentMessages).values({
      analysisId,
      agentRole,
      content: result.message,
      metadata: result.data ? { data: result.data } : undefined,
    });

    // Emit real-time message
    this.io.emit('agent:message', {
      analysisId,
      agentRole,
      content: result.message,
      timestamp: new Date(),
    });
  }

  /**
   * Emit agent status update
   */
  private emitAgentStatus(
    analysisId: string,
    agentRole: string,
    status: 'working' | 'done'
  ): void {
    this.io.emit('workflow:status', {
      analysisId,
      agentRole,
      status,
    });
  }
}
