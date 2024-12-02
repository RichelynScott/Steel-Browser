import Steel from 'steel-sdk';
import { URL } from 'url';
import { writeFile } from 'fs/promises';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import robotsParser from 'robots-parser';

export interface SitemapConfig {
  steelApiKey: string;
  baseUrl: string;
  maxDepth?: number;
  maxUrls?: number;
  respectRobotsTxt?: boolean;
  crawlDelay?: number;
  excludePatterns?: string[];
  includePatterns?: string[];
  outputFormat?: 'xml' | 'json' | 'txt';
}

export class SteelSitemapGenerator {
  private steel: Steel;
  private visited: Set<string> = new Set();
  private queue: { url: string; depth: number }[] = [];
  private robotsTxt: any = null;
  private config: Required<SitemapConfig>;

  constructor(config: SitemapConfig) {
    this.config = {
      maxDepth: 3,
      maxUrls: 1000,
      respectRobotsTxt: true,
      crawlDelay: 1000,
      excludePatterns: [],
      includePatterns: [],
      outputFormat: 'xml',
      ...config
    };

    this.steel = new Steel({
      steelAPIKey: config.steelApiKey
    });
  }

  private async fetchRobotsTxt(): Promise<void> {
    if (!this.config.respectRobotsTxt) return;

    const session = await this.steel.sessions.create();
    try {
      const browser = await this.steel.connect(session.id);
      const page = await browser.newPage();
      
      const robotsUrl = new URL('/robots.txt', this.config.baseUrl).toString();
      const response = await page.goto(robotsUrl);
      const content = await response?.text() || '';
      
      this.robotsTxt = robotsParser(robotsUrl, content);
    } catch (error) {
      console.warn('Failed to fetch robots.txt:', error);
    } finally {
      await this.steel.sessions.release(session.id);
    }
  }

  private isAllowed(url: string): boolean {
    if (!this.config.respectRobotsTxt || !this.robotsTxt) return true;
    return this.robotsTxt.isAllowed(url, 'Steel-Browser');
  }

  private matchesPatterns(url: string): boolean {
    if (this.config.excludePatterns.some(pattern => url.match(pattern))) {
      return false;
    }
    if (this.config.includePatterns.length === 0) return true;
    return this.config.includePatterns.some(pattern => url.match(pattern));
  }

  private async extractLinks(page: any): Promise<string[]> {
    return await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      return links
        .map(link => link.getAttribute('href'))
        .filter(href => href && !href.startsWith('#') && !href.startsWith('javascript:'))
        .map(href => new URL(href!, window.location.href).toString());
    });
  }

  private async crawlPage(url: string, depth: number, session: any): Promise<void> {
    if (
      depth > this.config.maxDepth ||
      this.visited.size >= this.config.maxUrls ||
      this.visited.has(url) ||
      !this.isAllowed(url) ||
      !this.matchesPatterns(url)
    ) {
      return;
    }

    this.visited.add(url);

    try {
      const browser = await this.steel.connect(session.id);
      const page = await browser.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle0' });
      const links = await this.extractLinks(page);
      
      for (const link of links) {
        if (!this.visited.has(link)) {
          this.queue.push({ url: link, depth: depth + 1 });
        }
      }

      await new Promise(resolve => setTimeout(resolve, this.config.crawlDelay));
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error);
    }
  }

  public async generate(): Promise<void> {
    await this.fetchRobotsTxt();
    
    const session = await this.steel.sessions.create();
    this.queue.push({ url: this.config.baseUrl, depth: 0 });

    try {
      while (this.queue.length > 0 && this.visited.size < this.config.maxUrls) {
        const { url, depth } = this.queue.shift()!;
        await this.crawlPage(url, depth, session);
      }

      await this.exportSitemap();
    } finally {
      await this.steel.sessions.release(session.id);
    }
  }

  private async exportSitemap(): Promise<void> {
    const urls = Array.from(this.visited);

    switch (this.config.outputFormat) {
      case 'xml':
        const stream = new SitemapStream({ hostname: this.config.baseUrl });
        const data = await streamToPromise(Readable.from(urls).pipe(stream));
        await writeFile('sitemap.xml', data.toString());
        break;

      case 'json':
        await writeFile('sitemap.json', JSON.stringify([...urls], null, 2));
        break;

      case 'txt':
        await writeFile('sitemap.txt', urls.join('\n'));
        break;
    }
  }
} 