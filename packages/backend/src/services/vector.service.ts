import { ChromaClient, Collection } from 'chromadb';
import { ollamaService } from './ollama.service';
import { config } from 'dotenv';

config();

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';

interface NewsDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  publishedAt: string;
  cryptocurrency?: string;
}

export class VectorService {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private collectionName = 'crypto_news';

  constructor() {
    this.client = new ChromaClient({
      path: CHROMA_URL,
    });
  }

  /**
   * Initialize collection (create or get existing)
   */
  async initialize(): Promise<void> {
    try {
      // Try to get existing collection
      this.collection = await this.client.getCollection({
        name: this.collectionName,
      });
      console.log('✅ ChromaDB collection retrieved');
    } catch (error) {
      // If doesn't exist, create it
      try {
        this.collection = await this.client.createCollection({
          name: this.collectionName,
          metadata: { 'hnsw:space': 'cosine' },
        });
        console.log('✅ ChromaDB collection created');
      } catch (createError) {
        console.error('Failed to create collection:', createError);
        throw createError;
      }
    }
  }

  /**
   * Add news article to vector store
   */
  async addNews(news: NewsDocument): Promise<void> {
    if (!this.collection) {
      await this.initialize();
    }

    try {
      // Generate embedding
      const text = `${news.title}\n\n${news.content}`;
      const embedding = await ollamaService.embed(text);

      // Add to ChromaDB
      await this.collection!.add({
        ids: [news.id],
        embeddings: [embedding],
        documents: [text],
        metadatas: [{
          title: news.title,
          source: news.source,
          publishedAt: news.publishedAt,
          cryptocurrency: news.cryptocurrency || 'unknown',
        }],
      });

      console.log(`✅ Added news to vector DB: ${news.title.substring(0, 50)}...`);
    } catch (error) {
      console.error('Failed to add news to vector DB:', error);
      throw error;
    }
  }

  /**
   * Add multiple news articles
   */
  async addManyNews(newsList: NewsDocument[]): Promise<void> {
    if (!this.collection) {
      await this.initialize();
    }

    try {
      const ids: string[] = [];
      const documents: string[] = [];
      const metadatas: any[] = [];

      // Process all news articles (without embeddings for now - MVP simplification)
      for (const news of newsList) {
        const text = `${news.title}\n\n${news.content}`;

        ids.push(news.id);
        documents.push(text);
        metadatas.push({
          title: news.title,
          source: news.source,
          publishedAt: news.publishedAt,
          cryptocurrency: news.cryptocurrency || 'unknown',
        });
      }

      // Add to ChromaDB (ChromaDB will auto-generate embeddings)
      await this.collection!.add({
        ids,
        documents,
        metadatas,
      });

      console.log(`✅ Added ${newsList.length} news articles to vector DB`);
    } catch (error) {
      console.error('Failed to add news batch to vector DB:', error);
      // Don't throw - continue without vector DB for MVP
      console.log('⚠️  Continuing without vector storage...');
    }
  }

  /**
   * Search for relevant news (RAG)
   */
  async searchNews(query: string, limit: number = 5): Promise<NewsDocument[]> {
    if (!this.collection) {
      await this.initialize();
    }

    try {
      // Generate query embedding
      const queryEmbedding = await ollamaService.embed(query);

      // Search in ChromaDB
      const results = await this.collection!.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
      });

      // Transform results
      const newsResults: NewsDocument[] = [];
      if (results.ids && results.ids[0] && results.metadatas && results.metadatas[0]) {
        for (let i = 0; i < results.ids[0].length; i++) {
          const metadata = results.metadatas[0][i] as any;
          newsResults.push({
            id: results.ids[0][i],
            title: metadata.title || '',
            content: results.documents?.[0]?.[i] || '',
            source: metadata.source || '',
            publishedAt: metadata.publishedAt || '',
            cryptocurrency: metadata.cryptocurrency,
          });
        }
      }

      console.log(`✅ Found ${newsResults.length} relevant news articles for query`);
      return newsResults;
    } catch (error) {
      console.error('Failed to search news in vector DB:', error);
      throw error;
    }
  }

  /**
   * Clear all news from collection
   */
  async clearAll(): Promise<void> {
    if (!this.collection) {
      await this.initialize();
    }

    try {
      await this.client.deleteCollection({ name: this.collectionName });
      await this.initialize(); // Recreate
      console.log('✅ Cleared all news from vector DB');
    } catch (error) {
      console.error('Failed to clear vector DB:', error);
      throw error;
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.heartbeat();
      return true;
    } catch (error) {
      console.error('ChromaDB connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const vectorService = new VectorService();
