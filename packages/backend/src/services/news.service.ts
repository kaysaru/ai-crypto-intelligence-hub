import { config } from 'dotenv';

config();

const CRYPTOPANIC_API_KEY = process.env.CRYPTOPANIC_API_KEY;
const CRYPTOPANIC_BASE_URL = 'https://cryptopanic.com/api/developer/v2';

interface CryptoPanicPost {
  id: number;
  slug: string;
  title: string;
  description?: string;
  published_at: string;
  created_at: string;
  kind: string;
}

interface CryptoPanicResponse {
  next: string | null;
  previous: string | null;
  results: CryptoPanicPost[];
}

export interface CryptoNews {
  id: string;
  title: string;
  content: string;
  url: string;
  source: string;
  publishedAt: Date;
  cryptocurrency: string;
}

export class NewsService {
  private apiKey: string;

  constructor() {
    if (!CRYPTOPANIC_API_KEY) {
      throw new Error('CRYPTOPANIC_API_KEY is not set in environment variables');
    }
    this.apiKey = CRYPTOPANIC_API_KEY;
  }

  /**
   * Fetch crypto news from CryptoPanic API
   */
  async fetchNews(cryptocurrency: string = 'BTC', limit: number = 15): Promise<CryptoNews[]> {
    try {
      const url = `${CRYPTOPANIC_BASE_URL}/posts/?auth_token=${this.apiKey}&currencies=${cryptocurrency}&kind=news`;
      
      console.log(`📰 Fetching news for ${cryptocurrency} from CryptoPanic...`);
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`CryptoPanic API error: ${response.status} ${response.statusText}`);
      }

      const data: CryptoPanicResponse = await response.json();
      
      // Transform to our format
      const news: CryptoNews[] = data.results
        .filter(post => post.kind === 'news' && post.description) // Only news with descriptions
        .slice(0, limit)
        .map(post => ({
          id: `cryptopanic-${post.id}`,
          title: post.title,
          content: post.description || post.title,
          url: `https://cryptopanic.com/news/${post.slug}`,
          source: 'CryptoPanic',
          publishedAt: new Date(post.published_at),
          cryptocurrency: cryptocurrency.toUpperCase(),
        }));

      console.log(`✅ Fetched ${news.length} news articles for ${cryptocurrency}`);
      return news;
    } catch (error) {
      console.error('Failed to fetch news from CryptoPanic:', error);
      throw error;
    }
  }

  /**
   * Fetch news for multiple cryptocurrencies
   */
  async fetchMultipleNews(cryptocurrencies: string[], limit: number = 10): Promise<CryptoNews[]> {
    try {
      const allNews: CryptoNews[] = [];
      
      for (const crypto of cryptocurrencies) {
        const news = await this.fetchNews(crypto, limit);
        allNews.push(...news);
      }

      console.log(`✅ Fetched total ${allNews.length} news articles for ${cryptocurrencies.length} cryptocurrencies`);
      return allNews;
    } catch (error) {
      console.error('Failed to fetch multiple crypto news:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = `${CRYPTOPANIC_BASE_URL}/posts/?auth_token=${this.apiKey}&currencies=BTC`;
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      console.error('CryptoPanic connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const newsService = new NewsService();
