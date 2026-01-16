/**
 * CLI Module
 * Handles command-line interface using commander
 * Parses arguments and displays progress/results
 */

import { Command } from 'commander';

export interface CLIOptions {
  url: string;
  output: string;
  depth?: number;
}

/**
 * Parse command-line arguments
 * @returns Parsed CLI options
 */
export function parseArguments(): CLIOptions {
  const program = new Command();

  program
    .name('email-extractor')
    .description('Recursively crawl websites and extract email addresses')
    .version('1.0.0')
    .requiredOption('-u, --url <url>', 'Target URL to crawl')
    .requiredOption('-o, --output <file>', 'Output CSV file path')
    .option('-d, --depth <number>', 'Maximum crawl depth (default: 3)', '3')
    .parse();

  const options = program.opts();

  return {
    url: options.url,
    output: options.output,
    depth: parseInt(options.depth, 10),
  };
}

/**
 * Display message indicating extraction has begun
 * @param url - Target URL being processed
 */
export function displayStartMessage(url: string): void {
  console.log(`Starting email extraction from: ${url}`);
}

/**
 * Display completion summary with email count
 * @param emailCount - Number of emails found
 * @param outputPath - Path to the output file
 */
export function displayCompletionSummary(emailCount: number, outputPath: string): void {
  console.log(`\nExtraction complete!`);
  console.log(`Emails found: ${emailCount}`);
  console.log(`Results saved to: ${outputPath}`);
}

/**
 * Display error message
 * @param error - Error to display
 */
export function displayError(error: Error): void {
  console.error(`\nError: ${error.message}`);
}
