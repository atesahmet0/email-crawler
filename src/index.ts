#!/usr/bin/env node

/**
 * Main Entry Point
 * Wires all components together and handles the email extraction workflow
 */

import { parseArguments, displayStartMessage, displayCompletionSummary, displayError, displayDebugModeActive } from './cli/cli.js';
import { createHTTPClient } from './client/http-client.js';
import { createCrawlerEngine } from './crawler/crawler-engine.js';
import { csvWriter } from './output/csv-writer.js';
import { deduplicate } from './output/deduplicator.js';
import { createLogger } from './logger/logger.js';

async function main() {
  try {
    // Parse command-line arguments
    const options = parseArguments();

    // Create logger based on debug flag
    const logger = createLogger(options.debug || false);

    // Display debug mode active message if enabled
    if (options.debug) {
      displayDebugModeActive();
    }

    // Display start message
    displayStartMessage(options.url);

    // Create HTTP client with logger
    const httpClient = createHTTPClient(undefined, logger);

    // Create crawler engine with logger
    const crawler = createCrawlerEngine(httpClient, logger);

    // Crawl and extract emails
    const results = await crawler.crawl(options.url, options.depth || 3);

    // Read existing emails from output file if it exists
    const existingResults = await csvWriter.read(options.output);
    const existingEmails = existingResults.map(r => r.email);

    // Deduplicate results (including against existing emails) with logger
    const uniqueResults = deduplicate(results, existingEmails, logger);

    // Write results to CSV file (append mode if file exists)
    const fileExists = existingResults.length > 0;
    await csvWriter.write(uniqueResults, options.output, fileExists);

    // Display completion summary
    displayCompletionSummary(uniqueResults.length, options.output);

  } catch (error) {
    // Handle and display errors
    if (error instanceof Error) {
      displayError(error);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

// Run the main function
main();
