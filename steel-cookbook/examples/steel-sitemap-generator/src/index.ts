import { SteelSitemapGenerator } from './generator';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const generator = new SteelSitemapGenerator({
    steelApiKey: process.env.STEEL_API_KEY!,
    baseUrl: 'https://example.com',
    maxDepth: 3,
    maxUrls: 1000,
    respectRobotsTxt: true,
    crawlDelay: 1000,
    excludePatterns: [
      /\.(jpg|jpeg|png|gif|pdf)$/i,
      /\?.*$/,
      /^(mailto|tel):/
    ],
    includePatterns: [
      /^https?:\/\/(www\.)?example\.com/
    ],
    outputFormat: 'xml'
  });

  console.log('Starting sitemap generation...');
  
  try {
    await generator.generate();
    console.log('Sitemap generation completed successfully!');
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    process.exit(1);
  }
}

main(); 