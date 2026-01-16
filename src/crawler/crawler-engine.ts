/**
 * Crawler Engine Module
 * Manages the crawling process, coordinating all components
 * Handles queue management, visited URL tracking, and depth limiting
 */

import { isValid, getDomain, normalizeURL } from '../validators/url-validator.js';
import { HTTPClient, HTTPResponse } from '../client/http-client.js';
import { parse } from '../parsers/html-parser.js';
import { extract } from '../extractors/email-extractor.js';
import { discoverLinks } from './link-discovery.js';
import { ExtractionResult } from '../output/csv-writer.js';
import { Logger } from '../logger/logger.js';

export interface CrawlerEngine {
  crawl(startURL: string, maxDepth: number, crossDomain?: boolean, maxPages?: number): Promise<ExtractionResult[]>;
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
  private logger: Logger;

  constructor(httpClient: HTTPClient, logger: Logger) {
    this.httpClient = httpClient;
    this.logger = logger;
  }

  /**
   * Crawls a website starting from the given URL up to the specified depth
   * @param startURL - The starting URL to begin crawling
   * @param maxDepth - Maximum depth to crawl (default: 3)
   * @param crossDomain - Allow crawling across different domains (default: false)
   * @param maxPages - Maximum number of pages to crawl (default: 100)
   * @returns Array of extraction results containing emails and their source URLs
   */
  async crawl(startURL: string, maxDepth: number = 3, crossDomain: boolean = false, maxPages: number = 100): Promise<ExtractionResult[]> {
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

    let pagesVisited = 0;

    // Process queue until empty or max pages reached
    while (state.queue.length > 0 && pagesVisited < maxPages) {
      const item = state.queue.shift()!;
      
      // Skip if already visited
      if (state.visited.has(item.url)) {
        this.logger.logURLSkipped(item.url, 'already-visited');
        continue;
      }

      // Skip if depth exceeds maximum
      if (item.depth > maxDepth) {
        this.logger.logURLSkipped(item.url, 'depth-limit');
        continue;
      }

      // Mark as visited
      state.visited.add(item.url);
      pagesVisited++;

      // Log URL visit
      this.logger.logURLVisit(item.url, item.depth);

      // Fetch the page
      let response: HTTPResponse;
      try {
        response = await this.httpClient.fetch(item.url);
      } catch (error) {
        // Handle any unexpected errors during fetch
        this.logger.logHTTPError(item.url, error instanceof Error ? error.message : String(error));
        continue;
      }

      // Skip if there was an error or non-success status
      if (response.error || response.status < 200 || response.status >= 300) {
        // Log skip message for non-success HTTP status
        if (response.status !== 0) {
          this.logger.logHTTPSkip(item.url, response.status);
        }
        continue;
      }

      // Parse HTML content and extract emails
      let parsed;
      let emails: string[] = [];
      
      try {
        parsed = parse(response.body);
        
        // Clear response body from memory immediately after parsing
        response.body = '';
        
        // Extract emails from text content
        emails = extract(parsed.textContent);
        
        // Clear text content from memory after extraction
        parsed.textContent = '';
      } catch (error) {
        this.logger.logHTTPError(item.url, `Failed to parse/extract: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }

      // Log email discovery results
      if (emails.length > 0) {
        this.logger.logEmailsFound(item.url, emails, emails.length);
      } else {
        this.logger.logNoEmailsFound(item.url);
      }

      // Add extraction results
      for (const email of emails) {
        state.results.push({
          email,
          sourceURL: item.url,
        });
      }

      // Discover same-domain links and add to queue (if not at max depth)
      if (item.depth < maxDepth) {
        try {
          const totalLinks = parsed.links.length;
          const newLinks = discoverLinks(parsed.links, baseDomain, item.url, crossDomain);
          const sameDomainLinks = newLinks.length;
          
          // Clear parsed links from memory
          parsed.links = [];
          
          let addedToQueue = 0;
          for (const link of newLinks) {
            try {
              const normalizedLink = normalizeURL(link);
              
              // Only add if not already visited and queue isn't too large
              if (!state.visited.has(normalizedLink) && state.queue.length < 1000) {
                state.queue.push({
                  url: normalizedLink,
                  depth: item.depth + 1,
                });
                addedToQueue++;
              }
            } catch (error) {
              // Skip invalid links silently
              continue;
            }
          }
          
          // Log link discovery statistics
          this.logger.logLinksDiscovered(totalLinks, sameDomainLinks, addedToQueue);
        } catch (error) {
          // If link discovery fails, just continue without adding links
          this.logger.logHTTPError(item.url, `Failed to discover links: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      // Trigger garbage collection hint by clearing references
      parsed = null;
      emails = [];
      response = null as any;
      
      // Allow event loop to process (helps with memory management)
      if (state.queue.length > 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }

    return state.results;
  }
}

/**
 * Creates a new crawler engine instance
 * @param httpClient - HTTP client to use for fetching pages
 * @param logger - Logger instance for debug output
 * @returns CrawlerEngine instance
 */
export function createCrawlerEngine(httpClient: HTTPClient, logger: Logger): CrawlerEngine {
  return new CrawlerEngineImpl(httpClient, logger);
}
