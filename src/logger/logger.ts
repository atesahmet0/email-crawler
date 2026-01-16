/**
 * Logger interface for debug mode output
 * Provides methods for logging various crawler operations
 */
export interface Logger {
  /**
   * Log when a URL is being visited
   * @param url - The URL being visited
   * @param depth - The current crawl depth
   */
  logURLVisit(url: string, depth: number): void;

  /**
   * Log when a URL is skipped
   * @param url - The URL being skipped
   * @param reason - The reason for skipping ('already-visited' or 'depth-limit')
   */
  logURLSkipped(url: string, reason: 'already-visited' | 'depth-limit'): void;

  /**
   * Log an HTTP request with its status code
   * @param url - The URL that was requested
   * @param status - The HTTP status code received
   */
  logHTTPRequest(url: string, status: number): void;

  /**
   * Log an HTTP error
   * @param url - The URL that failed
   * @param error - The error message
   */
  logHTTPError(url: string, error: string): void;

  /**
   * Log when a page is skipped due to non-success HTTP status
   * @param url - The URL that was skipped
   * @param status - The HTTP status code
   */
  logHTTPSkip(url: string, status: number): void;

  /**
   * Log when emails are found on a page
   * @param url - The source URL
   * @param emails - Array of email addresses found
   * @param count - Number of emails found
   */
  logEmailsFound(url: string, emails: string[], count: number): void;

  /**
   * Log when no emails are found on a page
   * @param url - The source URL
   */
  logNoEmailsFound(url: string): void;

  /**
   * Log link discovery statistics
   * @param totalLinks - Total number of links found
   * @param sameDomainLinks - Number of same-domain links
   * @param addedToQueue - Number of links added to the queue
   */
  logLinksDiscovered(totalLinks: number, sameDomainLinks: number, addedToQueue: number): void;

  /**
   * Log when a duplicate email is filtered
   * @param email - The duplicate email address
   */
  logDuplicateEmail(email: string): void;

  /**
   * Log deduplication summary
   * @param beforeCount - Count before deduplication
   * @param afterCount - Count after deduplication
   */
  logDeduplicationSummary(beforeCount: number, afterCount: number): void;

  /**
   * Log that debug mode is active
   */
  logDebugModeActive(): void;
}

/**
 * DebugLogger implementation that outputs formatted messages to console
 */
export class DebugLogger implements Logger {
  private readonly prefix = '[DEBUG]';

  logURLVisit(url: string, depth: number): void {
    console.log(`${this.prefix} Visiting URL (depth ${depth}): ${url}`);
  }

  logURLSkipped(url: string, reason: 'already-visited' | 'depth-limit'): void {
    const reasonText = reason === 'already-visited' 
      ? 'already visited' 
      : 'depth limit reached';
    console.log(`${this.prefix} Skipping URL (${reasonText}): ${url}`);
  }

  logHTTPRequest(url: string, status: number): void {
    console.log(`${this.prefix} HTTP ${status}: ${url}`);
  }

  logHTTPError(url: string, error: string): void {
    console.log(`${this.prefix} HTTP Error for ${url}: ${error}`);
  }

  logHTTPSkip(url: string, status: number): void {
    console.log(`${this.prefix} Skipping page (HTTP ${status}): ${url}`);
  }

  logEmailsFound(url: string, emails: string[], count: number): void {
    console.log(`${this.prefix} Found ${count} email(s) on ${url}:`);
    emails.forEach(email => {
      console.log(`${this.prefix}   - ${email}`);
    });
  }

  logNoEmailsFound(url: string): void {
    console.log(`${this.prefix} No emails found on ${url}`);
  }

  logLinksDiscovered(totalLinks: number, sameDomainLinks: number, addedToQueue: number): void {
    console.log(`${this.prefix} Link discovery: ${totalLinks} total, ${sameDomainLinks} same-domain, ${addedToQueue} added to queue`);
  }

  logDuplicateEmail(email: string): void {
    console.log(`${this.prefix} Filtering duplicate email: ${email}`);
  }

  logDeduplicationSummary(beforeCount: number, afterCount: number): void {
    const removed = beforeCount - afterCount;
    console.log(`${this.prefix} Deduplication complete: ${beforeCount} → ${afterCount} (removed ${removed} duplicate(s))`);
  }

  logDebugModeActive(): void {
    console.log(`${this.prefix} Debug mode is active`);
  }
}

/**
 * SilentLogger implementation with no-op methods for normal mode
 * Ensures zero performance overhead when debug mode is disabled
 */
export class SilentLogger implements Logger {
  logURLVisit(): void {}
  logURLSkipped(): void {}
  logHTTPRequest(): void {}
  logHTTPError(): void {}
  logHTTPSkip(): void {}
  logEmailsFound(): void {}
  logNoEmailsFound(): void {}
  logLinksDiscovered(): void {}
  logDuplicateEmail(): void {}
  logDeduplicationSummary(): void {}
  logDebugModeActive(): void {}
}

/**
 * Factory function to create the appropriate logger based on debug mode
 * @param debugMode - Whether debug mode is enabled
 * @returns DebugLogger if debugMode is true, SilentLogger otherwise
 */
export function createLogger(debugMode: boolean): Logger {
  return debugMode ? new DebugLogger() : new SilentLogger();
}
