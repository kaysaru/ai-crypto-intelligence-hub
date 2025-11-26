import { BaseAgent, AgentContext, AgentResult } from './base-agent';

export class ReportWriterAgent extends BaseAgent {
  constructor() {
    super(
      'report-writer',
      `You are a professional crypto market analyst and report writer. 
Generate comprehensive, well-structured analysis reports that combine news, sentiment, and technical insights.
Write in a clear, professional tone. Include:
- Executive Summary
- Market Analysis
- Sentiment Overview
- Key Findings
- Recommendations
Format your response as a structured report.`
    );
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      this.log(`Writing report for ${context.cryptocurrency}...`);

      // Extract data from previous agents
      const newsData = context.newsData || {};
      const sentimentData = context.sentimentData || {};

      // Build comprehensive prompt
      const prompt = `Generate a comprehensive crypto analysis report for ${context.cryptocurrency}.

NEWS SUMMARY:
${newsData.summary || 'No news summary available'}
News articles analyzed: ${newsData.newsCount || 0}

SENTIMENT ANALYSIS:
Overall Sentiment: ${sentimentData.overallSentiment || 'Unknown'}
Fear & Greed Index: ${sentimentData.fearGreedIndex || 50}/100
Confidence: ${sentimentData.confidence || 50}%

Bullish Points:
${sentimentData.bullishPoints?.map((p: string) => `- ${p}`).join('\n') || '- None'}

Bearish Points:
${sentimentData.bearishPoints?.map((p: string) => `- ${p}`).join('\n') || '- None'}

Key Drivers:
${sentimentData.keyDrivers?.map((d: string) => `- ${d}`).join('\n') || '- None'}

Generate a detailed analysis report with the following sections:
1. EXECUTIVE SUMMARY (2-3 paragraphs)
2. MARKET NARRATIVE (what's happening in the news)
3. SENTIMENT ANALYSIS (interpret the data above)
4. KEY INSIGHTS (3-5 bullet points)
5. RISK ASSESSMENT (major risks and opportunities)
6. RECOMMENDATIONS (actionable advice)

Write professionally and be specific with data points.`;

      const report = await this.generate(prompt);

      this.log('Report generation completed');

      return {
        success: true,
        message: 'Comprehensive analysis report generated',
        data: {
          report: report,
          cryptocurrency: context.cryptocurrency,
          newsAnalyzed: newsData.newsCount || 0,
          sentiment: sentimentData.overallSentiment || 'Unknown',
          fearGreedIndex: sentimentData.fearGreedIndex || 50,
        },
      };
    } catch (error: any) {
      this.log(`Error: ${error.message}`);
      return {
        success: false,
        message: 'Failed to generate report',
        error: error.message,
      };
    }
  }
}
