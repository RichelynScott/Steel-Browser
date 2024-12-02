# Steel + GitDigest Integration Guide

This guide demonstrates how to use [GitDigest](https://github.com/RichelynScott/GitDigest) with Steel Browser to create powerful code analysis and web automation workflows.

## Overview

GitDigest is a tool that creates a single, LLM-friendly digest of a GitHub repository. When combined with Steel Browser, you can:
1. Analyze repositories before web automation
2. Generate documentation from code
3. Create intelligent web agents with codebase understanding

## Prerequisites

- Steel API key
- Node.js 16+
- Python 3.8+
- GitDigest installed
- Steel Browser running

## Installation

```bash
# Install GitDigest
git clone https://github.com/RichelynScott/GitDigest
cd GitDigest
pip install -r requirements.txt

# Install Steel dependencies
npm install steel-sdk
```

## Example: Repository Analysis Workflow

Here's an example that:
1. Uses GitDigest to analyze a repository
2. Feeds the analysis to an LLM
3. Uses Steel Browser to implement the LLM's suggestions

```typescript
import Steel from 'steel-sdk';
import { execSync } from 'child_process';
import * as fs from 'fs';

async function analyzeAndAutomate() {
  // 1. Run GitDigest
  execSync('python gitdigest.py --repo your-repo-url --output digest.txt');
  
  // 2. Read the digest
  const digest = fs.readFileSync('digest.txt', 'utf-8');
  
  // 3. Initialize Steel
  const steel = new Steel({
    steelAPIKey: process.env.STEEL_API_KEY
  });

  // 4. Create a browser session
  const session = await steel.sessions.create();
  
  try {
    // 5. Connect browser
    const browser = await steel.connect(session.id);
    const page = await browser.newPage();
    
    // 6. Use the digest to inform automation
    await page.goto('your-target-url');
    // ... implement automation based on digest analysis
    
  } finally {
    // 7. Cleanup
    await steel.sessions.release(session.id);
  }
}
```

## Advanced Examples

### 1. Automated Documentation Generation

This example uses GitDigest to analyze a codebase and automatically update its documentation website:

```typescript
import Steel from 'steel-sdk';
import { execSync } from 'child_process';
import * as fs from 'fs';

async function generateDocumentation() {
  const steel = new Steel({ steelAPIKey: process.env.STEEL_API_KEY });
  let session;

  try {
    // Analyze repository
    execSync('python gitdigest.py --repo your-repo-url --focus "docs,comments,interfaces" --output docs-digest.txt');
    const digest = fs.readFileSync('docs-digest.txt', 'utf-8');

    // Create browser session
    session = await steel.sessions.create({
      userAgent: 'Steel-Doc-Generator/1.0'
    });

    const browser = await steel.connect(session.id);
    const page = await browser.newPage();

    // Login to documentation platform
    await page.goto('https://your-docs-platform.com/login');
    await page.fill('#username', process.env.DOCS_USERNAME!);
    await page.fill('#password', process.env.DOCS_PASSWORD!);
    await page.click('button[type="submit"]');

    // Update documentation
    await page.goto('https://your-docs-platform.com/edit');
    await page.fill('#content', formatDocsFromDigest(digest));
    await page.click('#save-button');

  } finally {
    if (session) {
      await steel.sessions.release(session.id);
    }
  }
}

function formatDocsFromDigest(digest: string): string {
  // Transform digest into documentation format
  // Implementation details...
  return formattedDocs;
}
```

### 2. Intelligent Testing Framework

This example uses GitDigest to analyze test files and create targeted test runs:

```typescript
import Steel from 'steel-sdk';
import { execSync } from 'child_process';

async function runIntelligentTests() {
  // Analyze test files
  execSync('python gitdigest.py --repo your-repo-url --focus "test,spec" --output test-digest.txt');
  
  const steel = new Steel({ steelAPIKey: process.env.STEEL_API_KEY });
  const session = await steel.sessions.create();

  try {
    const browser = await steel.connect(session.id);
    const context = await browser.newContext({
      recordVideo: { dir: 'test-videos/' }
    });

    // Run tests based on analysis
    const testCases = parseTestCases('test-digest.txt');
    for (const test of testCases) {
      const page = await context.newPage();
      await runTest(page, test);
    }

  } finally {
    await steel.sessions.release(session.id);
  }
}

interface TestCase {
  url: string;
  actions: string[];
  assertions: string[];
}

async function runTest(page: any, test: TestCase) {
  await page.goto(test.url);
  for (const action of test.actions) {
    // Execute test actions
  }
  // Verify assertions
}
```

### 3. Dependency Update Checker

This example analyzes dependencies and checks for updates:

```typescript
import Steel from 'steel-sdk';
import { execSync } from 'child_process';

async function checkDependencies() {
  // Analyze dependencies
  execSync('python gitdigest.py --repo your-repo-url --focus "package.json,requirements.txt" --output deps.txt');
  
  const steel = new Steel({ steelAPIKey: process.env.STEEL_API_KEY });
  const session = await steel.sessions.create();

  try {
    const browser = await steel.connect(session.id);
    const page = await browser.newPage();

    const deps = parseDependencies('deps.txt');
    const updates = [];

    for (const dep of deps) {
      // Check npm
      await page.goto(`https://www.npmjs.com/package/${dep.name}`);
      const latestVersion = await page.evaluate(() => {
        return document.querySelector('.version')?.textContent;
      });

      if (latestVersion !== dep.version) {
        updates.push({ name: dep.name, current: dep.version, latest: latestVersion });
      }
    }

    // Generate update report
    fs.writeFileSync('updates.json', JSON.stringify(updates, null, 2));

  } finally {
    await steel.sessions.release(session.id);
  }
}
```

## Best Practices

1. **Context Window Management**
   - Consider the size of your repository
   - Use GitDigest's filtering options for large codebases
   - Split analysis into manageable chunks

2. **Error Handling**
   ```typescript
   try {
     const digest = await runGitDigest();
     // Process digest
   } catch (error) {
     if (error.message.includes('context length')) {
       // Split into smaller chunks
       const chunks = splitRepository();
       for (const chunk of chunks) {
         await processChunk(chunk);
       }
     }
   }
   ```

3. **Security**
   ```typescript
   // Good: Use environment variables
   const config = {
     steelApiKey: process.env.STEEL_API_KEY,
     githubToken: process.env.GITHUB_TOKEN
   };

   // Good: Sanitize repository data
   function sanitizeRepoData(digest: string): string {
     return digest.replace(/[^\w\s-]/g, '');
   }
   ```

## Common Use Cases

1. **Code Review Automation**
   ```typescript
   async function automateCodeReview() {
     const digest = await getGitDigest();
     const issues = await analyzeCode(digest);
     await createGitHubIssues(issues);
   }
   ```

2. **Documentation Sync**
   ```typescript
   async function syncDocs() {
     const digest = await getGitDigest();
     await updateReadme(digest);
     await updateWiki(digest);
   }
   ```

3. **Dependency Management**
   ```typescript
   async function manageDependencies() {
     const digest = await getGitDigest();
     const outdated = await checkDependencies(digest);
     await createUpdatePR(outdated);
   }
   ```

## Troubleshooting

1. **Context Window Limits**
   ```typescript
   function handleLargeRepo() {
     const chunks = splitRepoBySize(MAX_CHUNK_SIZE);
     return Promise.all(chunks.map(processChunk));
   }
   ```

2. **Rate Limiting**
   ```typescript
   async function handleRateLimits() {
     const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
     let retries = 3;
     
     while (retries > 0) {
       try {
         return await makeRequest();
       } catch (error) {
         if (error.status === 429) {
           await delay(1000);
           retries--;
         } else throw error;
       }
     }
   }
   ```

3. **Memory Management**
   ```typescript
   function manageMemory() {
     const stream = createReadStream('digest.txt');
     return new Promise((resolve, reject) => {
       let result = '';
       stream.on('data', chunk => {
         result += processChunk(chunk);
       });
       stream.on('end', () => resolve(result));
       stream.on('error', reject);
     });
   }
   ```

## Resources

- [Steel Documentation](https://steel.dev)
- [GitDigest Repository](https://github.com/RichelynScott/GitDigest)
- [Integration Examples](https://github.com/steel-dev/steel-cookbook) 