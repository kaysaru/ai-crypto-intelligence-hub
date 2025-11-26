import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { newsService, CryptoNews } from '../services/news.service';
import { vectorService } from '../services/vector.service';

export class NewsCollectorAgent extends BaseAgent {
  constructor() {
    super(
      'news-collector',
      `You are a crypto news collector agent. Your task is to fetch and organize cryptocurrency news articles.
Focus on relevance, recency, and quality. Provide a brief summary of what news you collected.`
    );
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      this.log(`Starting news collection for ${context.cryptocurrency}...`);

      // Fetch news from CryptoPanic API
      const news = await newsService.fetchNews(context.cryptocurrency, 15);

      if (news.length === 0) {
        return {
          success: false,
          message: 'No news articles found',
          error: 'No news available for this cryptocurrency',
        };
      }

      this.log(`Fetched ${news.length} news articles`);

      // Store in vector database for RAG
      this.log('Storing news in vector database...');
      const newsDocuments = news.map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        source: article.source,
        publishedAt: article.publishedAt.toISOString(),
        cryptocurrency: article.cryptocurrency,
      }));

      await vectorService.addManyNews(newsDocuments);

      // Generate summary using LLM
      const newsTitles = news.slice(0, 10).map((n, i) => `${i + 1}. ${n.title}`).join('\n');
      const prompt = `Summarize the key themes from these ${news.length} crypto news headlines:\n\n${newsTitles}\n\nProvide a 2-3 sentence summary of the main market narrative.`;
      
      const summary = await this.generate(prompt);

      this.log('News collection completed');

      return {
        success: true,
        message: `Collected ${news.length} news articles. ${summary}`,
        data: {
          newsCount: news.length,
          news: news,
          summary: summary,
        },
      };
    } catch (error: any) {
      this.log(`Error: ${error.message}`);
      return {
        success: false,
        message: 'Failed to collect news',
        error: error.message,
      };
    }
  }
}
