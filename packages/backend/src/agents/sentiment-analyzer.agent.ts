import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { vectorService } from '../services/vector.service';

export class SentimentAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      'sentiment-analyzer',
      `You are a crypto market sentiment analyzer. Analyze news articles and provide:
1. Overall sentiment (bullish/bearish/neutral)
2. Fear & Greed score (0-100, where 0=extreme fear, 50=neutral, 100=extreme greed)
3. Key sentiment drivers
4. Market psychology insights

Be objective and data-driven. Focus on market impact.`
    );
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      this.log(`Analyzing sentiment for ${context.cryptocurrency}...`);

      // Get news data from context (skip RAG for MVP)
      const newsData = context.newsData;
      if (!newsData || !newsData.news || newsData.news.length === 0) {
        return {
          success: false,
          message: 'No news available for sentiment analysis',
          error: 'No news data in context',
        };
      }

      this.log(`Analyzing ${newsData.news.length} news articles`);

      // Prepare news summary for LLM
      const newsContext = newsData.news
        .slice(0, 10)
        .map((news: any, i: number) => `[Article ${i + 1}] ${news.title}\n${news.content}`)
        .join('\n\n');

      // Generate sentiment analysis
      const prompt = `Analyze the market sentiment for ${context.cryptocurrency} based on these recent news articles:

${newsContext}

Provide your analysis in the following JSON format:
{
  "overallSentiment": "bullish" | "bearish" | "neutral",
  "fearGreedIndex": <number 0-100>,
  "confidence": <number 0-100>,
  "bullishPoints": ["point1", "point2", ...],
  "bearishPoints": ["point1", "point2", ...],
  "keyDrivers": ["driver1", "driver2", ...],
  "summary": "<2-3 sentence summary>"
}`;

      const response = await this.generate(prompt);

      // Parse LLM response
      let sentimentData;
      try {
        // Extract JSON from response (LLM might add markdown or text around it)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          sentimentData = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback if no JSON found
          sentimentData = {
            overallSentiment: 'neutral',
            fearGreedIndex: 50,
            confidence: 50,
            bullishPoints: [],
            bearishPoints: [],
            keyDrivers: [],
            summary: response.substring(0, 200),
          };
        }
      } catch (parseError) {
        this.log('Failed to parse JSON, using fallback');
        sentimentData = {
          overallSentiment: 'neutral',
          fearGreedIndex: 50,
          confidence: 50,
          bullishPoints: [],
          bearishPoints: [],
          keyDrivers: [],
          summary: response.substring(0, 200),
        };
      }

      const message = `Sentiment: ${sentimentData.overallSentiment.toUpperCase()} | Fear/Greed: ${sentimentData.fearGreedIndex}/100. ${sentimentData.summary}`;
      
      this.log('Sentiment analysis completed');

      return {
        success: true,
        message: message,
        data: {
          ...sentimentData,
          newsAnalyzed: newsData.news.length,
        },
      };
    } catch (error: any) {
      this.log(`Error: ${error.message}`);
      return {
        success: false,
        message: 'Failed to analyze sentiment',
        error: error.message,
      };
    }
  }
}
