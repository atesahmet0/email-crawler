# Implementation Plan

- [x] 1. Create Logger interface and implementations
  - [x] 1.1 Create Logger interface with all required methods
    - Define Logger interface in new `src/logger/logger.ts` file
    - Include methods for URL visits, skips, HTTP operations, email discoveries, link operations, and deduplication
    - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 4.1, 5.1, 6.1, 7.1_

  - [x] 1.2 Implement DebugLogger class
    - Create DebugLogger that outputs formatted messages to console
    - Use consistent `[DEBUG]` prefix for all messages
    - Format messages with clear, readable output
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_

  - [x] 1.3 Implement SilentLogger class
    - Create SilentLogger with no-op implementations for all methods
    - Ensure zero performance overhead
    - _Requirements: 1.2_

  - [x] 1.4 Create logger factory function
    - Implement `createLogger(debugMode: boolean)` factory function
    - Return DebugLogger when debugMode is true, SilentLogger otherwise
    - _Requirements: 1.1, 1.2_

  - [ ]* 1.5 Write unit tests for logger implementations
    - Test DebugLogger outputs correct formatted messages
    - Test SilentLogger produces no output
    - Test logger factory creates correct logger type
    - _Requirements: 1.1, 1.2, 7.1_

  - [ ]* 1.6 Write property test for debug message prefix consistency
    - **Property 11: Debug messages have consistent prefix**
    - **Validates: Requirements 7.1**

- [x] 2. Update CLI to support debug flag
  - [x] 2.1 Add debug option to CLI parser
    - Modify `parseArguments()` in `src/cli/cli.ts` to accept `--debug` or `-D` flag
    - Update CLIOptions interface to include optional `debug` boolean field
    - _Requirements: 1.1_

  - [x] 2.2 Add debug mode activation message
    - Create `displayDebugModeActive()` function in CLI module
    - Display confirmation message when debug mode is enabled
    - _Requirements: 1.3_

  - [ ]* 2.3 Write unit tests for CLI debug flag parsing
    - Test parsing with --debug flag sets debug to true
    - Test parsing without --debug flag sets debug to false or undefined
    - Test short form -D flag works correctly
    - _Requirements: 1.1, 1.2_

  - [ ]* 2.4 Write property test for debug flag parsing
    - **Property 1: Debug flag parsing**
    - **Validates: Requirements 1.1, 1.2**

- [x] 3. Integrate logger into CrawlerEngine
  - [x] 3.1 Update CrawlerEngine to accept logger
    - Modify CrawlerEngineImpl constructor to accept Logger parameter
    - Update createCrawlerEngine factory to accept and pass logger
    - Store logger as instance variable
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Add URL visit logging
    - Call `logger.logURLVisit(url, depth)` when processing each URL from queue
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Add URL skip logging
    - Call `logger.logURLSkipped(url, 'already-visited')` when URL is in visited set
    - Call `logger.logURLSkipped(url, 'depth-limit')` when depth exceeds maxDepth
    - _Requirements: 2.3, 2.4_

  - [ ]* 3.4 Write property test for URL visit logging
    - **Property 2: URL visit logging includes URL and depth**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 3.5 Write property test for URL skip logging
    - **Property 3: Skipped URLs are logged with reason**
    - **Validates: Requirements 2.3, 2.4**

- [x] 4. Integrate logger into HTTPClient
  - [x] 4.1 Update HTTPClient to accept logger
    - Modify createHTTPClient factory to accept Logger parameter
    - Pass logger to HTTPClient implementation
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 4.2 Add HTTP request logging
    - Call `logger.logHTTPRequest(url, status)` after receiving response
    - Call `logger.logHTTPError(url, error)` when request fails
    - _Requirements: 5.1, 5.2_

  - [ ]* 4.3 Write property test for HTTP status logging
    - **Property 7: HTTP status codes are logged**
    - **Validates: Requirements 5.1**

  - [ ]* 4.4 Write property test for HTTP error logging
    - **Property 8: HTTP errors are logged**
    - **Validates: Requirements 5.2**

- [x] 5. Integrate logger into email extraction
  - [x] 5.1 Update CrawlerEngine to log email discoveries
    - After calling `extract()`, log results using `logger.logEmailsFound()` or `logger.logNoEmailsFound()`
    - Include URL, email list, and count in log call
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 5.2 Write property test for email discovery logging
    - **Property 4: Email discoveries are logged with source**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 5.3 Write property test for email count logging
    - **Property 5: Email count is logged**
    - **Validates: Requirements 3.4**

- [x] 6. Integrate logger into link discovery
  - [x] 6.1 Update CrawlerEngine to log link discovery statistics
    - After calling `discoverLinks()`, calculate and log statistics
    - Log total links found, same-domain links, and links added to queue
    - Call `logger.logLinksDiscovered(totalLinks, sameDomainLinks, addedToQueue)`
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 6.2 Write property test for link discovery logging
    - **Property 10: Link discovery statistics are logged**
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ] 7. Integrate logger into deduplication
  - [ ] 7.1 Update deduplicate function to accept logger
    - Modify `deduplicate()` function signature to accept optional Logger parameter
    - Update deduplicator class to accept logger in constructor or method
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 7.2 Add duplicate email logging
    - Call `logger.logDuplicateEmail(email)` when filtering duplicate emails
    - Call `logger.logDeduplicationSummary(beforeCount, afterCount)` after deduplication completes
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 7.3 Write property test for duplicate email logging
    - **Property 6: Duplicate emails are logged with reason**
    - **Validates: Requirements 4.1, 4.2**

- [ ] 8. Wire everything together in main entry point
  - [ ] 8.1 Update main function to create and pass logger
    - Parse CLI options including debug flag
    - Create logger using `createLogger(options.debug || false)`
    - Display debug mode active message if enabled
    - Pass logger to all component factories (HTTPClient, CrawlerEngine, deduplicator)
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 8.2 Add HTTP skip logging to main function
    - After receiving non-success HTTP response, log skip message before continuing
    - Call appropriate logger method when skipping due to HTTP errors
    - _Requirements: 5.3_

  - [ ]* 8.3 Write property test for non-success HTTP skip messages
    - **Property 9: Non-success HTTP responses trigger skip messages**
    - **Validates: Requirements 5.3**

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 10. Write integration tests for end-to-end debug mode
  - [ ]* 10.1 Write integration test for debug mode enabled
    - Test full crawl with debug mode produces expected log output
    - Verify all log types appear in output
    - _Requirements: All_

  - [ ]* 10.2 Write integration test for debug mode disabled
    - Test full crawl without debug mode produces no debug output
    - Verify CSV results are identical with or without debug mode
    - _Requirements: 1.2_

  - [ ]* 10.3 Write integration test for debug mode with various CLI options
    - Test debug mode works with different depth values
    - Test debug mode works with different output paths
    - _Requirements: 1.1, 1.2_
