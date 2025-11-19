import { db, newsArticles, cryptoPrices } from './index';

async function main() {
  console.log('Seeding database...');
  
  // Seed sample news articles
  await db.insert(newsArticles).values([
    {
      title: 'Bitcoin Reaches New Resistance at $45,000',
      content: 'Bitcoin (BTC) has hit a significant resistance level at $45,000 as traders await the next market move. Technical analysts suggest...',
      url: 'https://example.com/btc-resistance',
      source: 'CoinDesk',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      cryptocurrency: 'BTC',
      sentiment: 0.3,
    },
    {
      title: 'Ethereum Upgrade Scheduled for Next Month',
      content: 'The Ethereum network is preparing for a major upgrade next month that will improve scalability and reduce gas fees...',
      url: 'https://example.com/eth-upgrade',
      source: 'CoinTelegraph',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      cryptocurrency: 'ETH',
      sentiment: 0.7,
    },
    {
      title: 'Market Volatility Increases as Economic Data Released',
      content: 'Cryptocurrency markets experienced increased volatility following the release of economic data showing...',
      url: 'https://example.com/market-volatility',
      source: 'CryptoNews',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      cryptocurrency: 'BTC',
      sentiment: -0.2,
    },
  ]);
  
  // Seed sample crypto prices
  await db.insert(cryptoPrices).values([
    {
      cryptocurrency: 'BTC',
      price: 44750,
      volume: 25000000000,
      marketCap: 875000000000,
      priceChange24h: 2.5,
    },
    {
      cryptocurrency: 'ETH',
      price: 2350,
      volume: 12000000000,
      marketCap: 282000000000,
      priceChange24h: 1.8,
    },
  ]);
  
  console.log('Database seeded successfully!');
}

main()
  .catch((err) => {
    console.error('Seeding failed!');
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
