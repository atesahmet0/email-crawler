import { describe, it, expect, vi } from 'vitest';
import { CrawlerEngineImpl } from './crawler-engine.js';
import { HTTPClient, HTTPResponse } from '../client/http-client.js';

describe('CrawlerEngine', () => {
  // Mock HTTP client for testing
  const createMockHTTPClient = (responses: Map<string, HTTPResponse>): HTTPClient => {
    return {
      fetch: vi.fn(async (url: string) => {
        const normalizedUrl = url.toLowerCase().replace(/\/$/, '');
        return responses.get(normalizedUrl) || {
          status: 404,
          body: '',
          error: 'Not found',
        };
      }),
    };
  };

  it('should crawl a single page and extract emails', async () => {
    const responses = new Map<string, HTTPResponse>([
      ['https://example.com', {
        status: 200,
        body: '<html><body>Contact us at info@example.com</body></html>',
      }],
    ]);

    const mockClient = createMockHTTPClient(responses);
    const crawler = new CrawlerEngineImpl(mockClient);

    const results = await crawler.crawl('https://example.com', 0);

    expect(results).toHaveLength(1);
    expect(results[0].email).toBe('info@example.com');
    expect(results[0].sourceURL).toBe('https://example.com/');
  });

  it('should follow same-domain links up to max depth', async () => {
    const responses = new Map<string, HTTPResponse>([
      ['https://example.com', {
        status: 200,
        body: '<html><body><a href="/about">About</a></body></html>',
      }],
      ['https://example.com/about', {
        status: 200,
        body: '<html><body>Email: contact@example.com</body></html>',
      }],
    ]);

    const mockClient = createMockHTTPClient(responses);
    const crawler = new CrawlerEngineImpl(mockClient);

    const results = await crawler.crawl('https://example.com', 1);

    expect(results).toHaveLength(1);
    expect(results[0].email).toBe('contact@example.com');
  });

  it('should not visit the same URL twice', async () => {
    const responses = new Map<string, HTTPResponse>([
      ['https://example.com', {
        status: 200,
        body: '<html><body><a href="/">Home</a><a href="/page">Page</a>Email: test@example.com</body></html>',
      }],
      ['https://example.com/page', {
        status: 200,
        body: '<html><body><a href="/">Home</a>Email: page@example.com</body></html>',
      }],
    ]);

    const mockClient = createMockHTTPClient(responses);
    const crawler = new CrawlerEngineImpl(mockClient);

    const results = await crawler.crawl('https://example.com', 2);

    // Should have visited example.com only once despite multiple links to it
    expect(mockClient.fetch).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(2);
  });

  it('should respect depth limits', async () => {
    const responses = new Map<string, HTTPResponse>([
      ['https://example.com', {
        status: 200,
        body: '<html><body><a href="/level1">Level 1</a></body></html>',
      }],
      ['https://example.com/level1', {
        status: 200,
        body: '<html><body><a href="/level2">Level 2</a></body></html>',
      }],
      ['https://example.com/level2', {
        status: 200,
        body: '<html><body><a href="/level3">Level 3</a></body></html>',
      }],
      ['https://example.com/level3', {
        status: 200,
        body: '<html><body>Deep email: deep@example.com</body></html>',
      }],
    ]);

    const mockClient = createMockHTTPClient(responses);
    const crawler = new CrawlerEngineImpl(mockClient);

    // With depth 1, should only visit example.com and level1
    const results = await crawler.crawl('https://example.com', 1);

    expect(mockClient.fetch).toHaveBeenCalledTimes(2);
  });

  it('should only follow same-domain links', async () => {
    const responses = new Map<string, HTTPResponse>([
      ['https://example.com', {
        status: 200,
        body: '<html><body><a href="/internal">Internal</a><a href="https://external.com">External</a></body></html>',
      }],
      ['https://example.com/internal', {
        status: 200,
        body: '<html><body>Email: internal@example.com</body></html>',
      }],
      ['https://external.com', {
        status: 200,
        body: '<html><body>Email: external@external.com</body></html>',
      }],
    ]);

    const mockClient = createMockHTTPClient(responses);
    const crawler = new CrawlerEngineImpl(mockClient);

    const results = await crawler.crawl('https://example.com', 1);

    // Should only have visited example.com and example.com/internal
    expect(mockClient.fetch).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(1);
    expect(results[0].email).toBe('internal@example.com');
  });

  it('should handle pages with no emails', async () => {
    const responses = new Map<string, HTTPResponse>([
      ['https://example.com', {
        status: 200,
        body: '<html><body>No emails here</body></html>',
      }],
    ]);

    const mockClient = createMockHTTPClient(responses);
    const crawler = new CrawlerEngineImpl(mockClient);

    const results = await crawler.crawl('https://example.com', 0);

    expect(results).toHaveLength(0);
  });

  it('should handle HTTP errors gracefully', async () => {
    const responses = new Map<string, HTTPResponse>([
      ['https://example.com', {
        status: 200,
        body: '<html><body><a href="/error">Error Page</a>Email: test@example.com</body></html>',
      }],
      ['https://example.com/error', {
        status: 500,
        body: '',
        error: 'Server error',
      }],
    ]);

    const mockClient = createMockHTTPClient(responses);
    const crawler = new CrawlerEngineImpl(mockClient);

    const results = await crawler.crawl('https://example.com', 1);

    // Should still get the email from the first page
    expect(results).toHaveLength(1);
    expect(results[0].email).toBe('test@example.com');
  });

  it('should throw error for invalid starting URL', async () => {
    const mockClient = createMockHTTPClient(new Map());
    const crawler = new CrawlerEngineImpl(mockClient);

    await expect(crawler.crawl('not-a-url', 1)).rejects.toThrow('Invalid URL');
  });

  it('should extract multiple emails from a single page', async () => {
    const responses = new Map<string, HTTPResponse>([
      ['https://example.com', {
        status: 200,
        body: '<html><body>Contact: info@example.com, sales@example.com, support@example.com</body></html>',
      }],
    ]);

    const mockClient = createMockHTTPClient(responses);
    const crawler = new CrawlerEngineImpl(mockClient);

    const results = await crawler.crawl('https://example.com', 0);

    expect(results).toHaveLength(3);
    expect(results.map(r => r.email)).toContain('info@example.com');
    expect(results.map(r => r.email)).toContain('sales@example.com');
    expect(results.map(r => r.email)).toContain('support@example.com');
  });
});
