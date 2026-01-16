/**
 * Crawler Engine Module
 * Manages the crawling process, coordinating all components
 * Handles queue management, visited URL tracking, and depth limiting
 */

import { isValid, getDomain, normalizeURL } from '../validators/url-validator.js';
import { HTTPClient } from '../client/http-client.js';
import { parse } from '../parsers/html-parser.js';
import { extract } from '../extractors/email-extractor.js';
import { discoverLinks } from './link-discovery.js';
import { ExtractionResult } from '../output/csv-writer.js';

export interface CrawlerEngine {
  crawl(startURL: string, maxDepth: number): Promise<ExtractionResult[]>;
}

interface QueueItem {
  url: string;
  depth: number;
}

interface CrawlState {
  queue: QueueItem[];
  visited: Set<string>;
  results: ExtractionResult[];
}

export class CrawlerEngineImpl implements CrawlerEngine {
  private httpClient: HTTPClient;

  constructor(httpClient: HTTPClient) {
    this.httpClient = httpClient;
  }

  /**
   * Crawls a website starting from the given URL up to the specified depth
   * @param startURL - The starting URL to begin crawling
   * @param maxDepth - Maximum depth to crawl (default: 3)
   * @returns Array of extraction results containing emails and their source URLs
   */
  async crawl(startURL: string, maxDepth: number = 3): Promise<ExtractionResult[]> {
    // Validate the starting URL
    if (!isValid(startURL)) {
      throw new Error(`Invalid URL: ${startURL}`);
    }

    // Normalize the starting URL
    const normalizedStartURL = normalizeURL(startURL);
    const baseDomain = getDomain(normalizedStartURL);

    if (!baseDomain) {
      throw new Error(`Could not extract domain from URL: ${startURL}`);
    }

    // Initialize crawl state
    const state: CrawlState = {
      queue: [{ url: normalizedStartURL, depth: 0 }],
      visited: new Set<string>(),
      results: [],
    };

    // Process queue until empty
    while (state.queue.length > 0) {
      const item = state.queue.shift()!;
      
      // Skip if already visited
      if (state.visited.has(item.url)) {
        continue;
      }

      // Skip if depth exceeds maximum
      if (item.depth > maxDepth) {
        continue;
      }

      // Mark as visited
      state.visited.add(item.url);

      // Fetch the page
      const response = await this.httpClient.fetch(item.url);

      // Skip if there was an error or non-success status
      if (response.error || response.status < 200 || response.status >= 300) {
        continue;
      }

      // Parse HTML content
      const parsed = parse(response.body);

      // Extract emails from text content
      const emails = extract(parsed.textContent);

      // Add extraction results
      for (const email of emails) {
        state.results.push({
          email,
          sourceURL: item.url,
        });
      }

      // Discover same-domain links and add to queue (if not at max depth)
      if (item.depth < maxDepth) {
        const newLinks = discoverLinks(parsed.links, baseDomain, item.url);
        
        for (const link of newLinks) {
          const normalizedLink = normalizeURL(link);
          
          // Only add if not already visited
          if (!state.visited.has(normalizedLink)) {
            state.queue.push({
              url: normalizedLink,
              depth: item.depth + 1,
            });
          }
        }
      }
    }

    return state.results;
  }
}

/**
 * Creates a new crawler engine instance
 * @param httpClient - HTTP client to use for fetching pages
 * @returns CrawlerEngine instance
 */
export function createCrawlerEngine(httpClient: HTTPClient): CrawlerEngine {
  return new CrawlerEngineImpl(httpClient);
}
