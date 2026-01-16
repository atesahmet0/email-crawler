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
  crawl(startURL: string, maxDepth: number, crossDomain?: boolean): Promise<ExtractionResult[]>;
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
   * @returns Array of extraction results containing emails and their source URLs
   */
  async crawl(startURL: string, maxDepth: number = 3, crossDomain: boolean = false): Promise<ExtractionResult[]> {
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

      // Parse HTML content
      let parsed;
      try {
        parsed = parse(response.body);
      } catch (error) {
        this.logger.logHTTPError(item.url, `Failed to parse HTML: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }

      // Extract emails from text content
      let emails: string[] = [];
      try {
        emails = extract(parsed.textContent);
      } catch (error) {
        this.logger.logHTTPError(item.url, `Failed to extract emails: ${error instanceof Error ? error.message : String(error)}`);
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
          
          let addedToQueue = 0;
          for (const link of newLinks) {
            try {
              const normalizedLink = normalizeURL(link);
              
              // Only add if not already visited
              if (!state.visited.has(normalizedLink)) {
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
