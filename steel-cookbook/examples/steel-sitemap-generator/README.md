# Steel Sitemap Generator

A TypeScript implementation of a sitemap generator using Steel Browser. This tool helps AI agents understand website structure before automation.

## Features

- Generate XML sitemaps from any website
- Support for robots.txt parsing
- Configurable crawl depth and limits
- Integration with Steel Browser sessions
- Export to multiple formats (XML, JSON, TXT)
- Rate limiting and polite crawling
- Custom URL filtering and patterns

## Installation

```bash
git clone https://github.com/steel-dev/steel-cookbook
cd examples/steel-sitemap-generator
npm install
```

## Quick Start

```typescript
import { SteelSitemapGenerator } from './src/generator';

const generator = new SteelSitemapGenerator({
  steelApiKey: 'your-api-key',
  baseUrl: 'https://example.com',
  maxDepth: 3,
  maxUrls: 1000
});

await generator.generate();
```

## Configuration Options

```typescript
interface SitemapConfig {
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
```

## Example Usage with Steel Browser

```typescript
// See index.ts for full example
```

## Best Practices

1. **Rate Limiting**
   - Use appropriate delays between requests
   - Respect robots.txt directives
   - Implement exponential backoff

2. **Memory Management**
   - Stream results for large sites
   - Use efficient data structures
   - Implement pagination

3. **Error Handling**
   - Handle network errors gracefully
   - Implement retry logic
   - Log issues for debugging

## Contributing

See our [Contributing Guide](../../CONTRIBUTING.md) for details on adding features or fixing bugs. 