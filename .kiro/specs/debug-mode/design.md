# Debug Mode Design Document

## Overview

The debug mode feature adds comprehensive diagnostic logging to the email extraction crawler. When enabled via a command-line flag, the system will output detailed information about every step of the crawling process, including URL visits, email discoveries, HTTP responses, link discovery, and deduplication decisions. This feature is designed to be non-intrusive, with zero performance impact when disabled, and provides clear, well-formatted output when enabled.

The design follows a logger-based approach where a debug logger is injected into existing components, maintaining separation of concerns and avoiding tight coupling between business logic and debug output.

## Architecture

### High-Level Design

The debug mode will be implemented using a **Logger abstraction** that can be injected into existing components. This approach:

1. Maintains existing component interfaces and responsibilities
2. Allows debug functionality to be toggled without code changes
3. Keeps debug logic separate from business logic
4. Enables easy testing of both debug and non-debug modes

### Component Interaction Flow

```
CLI Parser → Logger Factory → Components (with Logger) → Console Output
```

1. CLI parser detects `--debug` flag
2. Logger factory creates appropriate logger (debug or silent)
3. Logger is injected into all components during initialization
4. Components call logger methods at key points
5. Logger outputs formatted messages to console (if debug mode active)

## Components and Interfaces

### 1. Logger Interface

A new `Logger` interface will be created to abstract debug output:

```typescript
export interface Logger {
  logURLVisit(url: string, depth: number): void;
  logURLSkipped(url: string, reason: 'already-visited' | 'depth-limit'): void;
  logHTTPRequest(url: string, status: number): void;
  logHTTPError(url: string, error: string): void;
  logEmailsFound(url: string, emails: string[], count: number): void;
  logNoEmailsFound(url: string): void;
  logLinksDiscovered(totalLinks: number, sameDomainLinks: number, addedToQueue: number): void;
  logDuplicateEmail(email: string): void;
  logDeduplicationSummary(beforeCount: number, afterCount: number): void;
  logDebugModeActive(): void;
}
```

### 2. Logger Implementations

**DebugLogger**: Outputs formatted debug messages to console

```typescript
export class DebugLogger implements Logger {
  private prefix = '[DEBUG]';
  
  logURLVisit(url: string, depth: number): void {
    console.log(`${this.prefix} Visiting URL (depth ${depth}): ${url}`);
  }
  
  // ... other methods with formatted output
}
```

**SilentLogger**: No-op implementation for normal mode

```typescript
export class SilentLogger implements Logger {
  logURLVisit(): void {}
  logURLSkipped(): void {}
  // ... all methods are no-ops
}
```

### 3. Logger Factory

Creates the appropriate logger based on debug flag:

```typescript
export function createLogger(debugMode: boolean): Logger {
  return debugMode ? new DebugLogger() : new SilentLogger();
}
```

### 4. Modified Components

The following components will be updated to accept and use a Logger:

**CrawlerEngine**: Logs URL visits, skips, and queue operations
**HTTPClient**: Logs HTTP requests and responses
**EmailExtractor**: Logs email discoveries
**LinkDiscovery**: Logs link discovery statistics
**Deduplicator**: Logs duplicate filtering and summary

Each component will receive the logger via constructor injection or factory function parameters.

## Data Models

### CLI Options Extension

```typescript
export interface CLIOptions {
  url: string;
  output: string;
  depth?: number;
  debug?: boolean;  // NEW: debug mode flag
}
```

### Logger Message Types

Debug messages will be categorized by type for consistent formatting:

- **URL Operations**: Visiting, skipping URLs
- **HTTP Operations**: Requests, responses, errors
- **Extraction Operations**: Emails found, counts
- **Link Operations**: Discovery, filtering, queue additions
- **Deduplication Operations**: Duplicate detection, summaries

## 
Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Debug flag parsing

*For any* command-line arguments, the parsed debug mode option should be true if and only if the debug flag is present in the arguments

**Validates: Requirements 1.1, 1.2**

### Property 2: URL visit logging includes URL and depth

*For any* URL visited by the crawler, when debug mode is active, the log output should contain both the URL and the current crawl depth

**Validates: Requirements 2.1, 2.2**

### Property 3: Skipped URLs are logged with reason

*For any* URL that is skipped (either due to being already visited or exceeding depth limit), when debug mode is active, the log output should contain the URL and the correct skip reason

**Validates: Requirements 2.3, 2.4**

### Property 4: Email discoveries are logged with source

*For any* emails extracted from a page, when debug mode is active, each email should appear in the log output along with its source URL

**Validates: Requirements 3.1, 3.2**

### Property 5: Email count is logged

*For any* page processed, when debug mode is active, the log output should contain the count of emails found on that page (including zero)

**Validates: Requirements 3.4**

### Property 6: Duplicate emails are logged with reason

*For any* email that is filtered during deduplication, when debug mode is active, the log output should contain both the email address and an indication that it was a duplicate

**Validates: Requirements 4.1, 4.2**

### Property 7: HTTP status codes are logged

*For any* HTTP request made by the crawler, when debug mode is active, the log output should contain the HTTP status code received

**Validates: Requirements 5.1**

### Property 8: HTTP errors are logged

*For any* HTTP request that fails with an error, when debug mode is active, the log output should contain the error message

**Validates: Requirements 5.2**

### Property 9: Non-success HTTP responses trigger skip messages

*For any* HTTP response with a non-success status code (not 2xx), when debug mode is active, the log output should contain a message indicating the page was skipped

**Validates: Requirements 5.3**

### Property 10: Link discovery statistics are logged

*For any* link discovery operation, when debug mode is active, the log output should contain the total link count, same-domain link count, and added-to-queue count

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 11: Debug messages have consistent prefix

*For any* debug log message, when debug mode is active, the message should start with a consistent debug identifier prefix

**Validates: Requirements 7.1**

## Error Handling

### Debug Mode Errors

Debug mode should never cause the application to fail. All debug logging operations should be wrapped in try-catch blocks to ensure that logging errors don't interrupt the crawling process.

**Error Handling Strategy:**

1. **Logger Failures**: If a logger method throws an exception, catch it silently and continue execution
2. **Console Output Failures**: If console output fails, continue crawling without debug output
3. **Invalid Logger State**: If logger is null or undefined, treat as silent logger

### Graceful Degradation

If debug mode encounters issues:
- The crawler should continue operating normally
- A single warning message may be displayed (not repeated)
- No debug output is better than crashing the application

## Testing Strategy

### Unit Testing

Unit tests will verify:

1. **CLI Parser**: Debug flag is correctly parsed from command-line arguments
2. **Logger Factory**: Correct logger type is created based on debug flag
3. **Logger Implementations**: Each logger method produces expected output format
4. **Component Integration**: Components correctly call logger methods at appropriate times

Example unit tests:
- Parse arguments with `--debug` flag returns `debug: true`
- Parse arguments without `--debug` flag returns `debug: false`
- DebugLogger outputs formatted messages to console
- SilentLogger produces no output
- CrawlerEngine calls `logURLVisit` when visiting a URL

### Property-Based Testing

Property-based testing will be used to verify universal properties across all inputs using the **fast-check** library (already in package.json). Each property-based test will run a minimum of 100 iterations.

Property tests will verify:

1. **Property 1**: CLI parsing correctly identifies debug flag across random argument combinations
2. **Property 2**: URL visit logs always contain URL and depth for random URLs and depths
3. **Property 3**: Skip logs always contain URL and correct reason for random skip scenarios
4. **Property 4**: Email logs always contain email and source URL for random email sets
5. **Property 5**: Email count logs always match actual count for random email sets
6. **Property 6**: Duplicate logs always contain email and duplicate indicator for random duplicates
7. **Property 7**: HTTP logs always contain status code for random status codes
8. **Property 8**: Error logs always contain error message for random errors
9. **Property 9**: Non-success status codes always trigger skip messages
10. **Property 10**: Link discovery logs always contain all three counts for random link sets
11. **Property 11**: All debug messages start with consistent prefix for random message types

Each property-based test will be tagged with a comment explicitly referencing the correctness property using the format: **Feature: debug-mode, Property {number}: {property_text}**

### Integration Testing

Integration tests will verify:

1. End-to-end crawling with debug mode enabled produces expected log output
2. End-to-end crawling with debug mode disabled produces no debug output
3. Debug output doesn't affect the final CSV results
4. Debug mode works correctly with all CLI options (depth, output file, etc.)

### Testing Approach

The dual testing approach ensures comprehensive coverage:
- **Unit tests** catch specific bugs in individual components and verify concrete examples
- **Property tests** verify general correctness across all possible inputs and edge cases
- Together they provide confidence that debug mode works correctly in all scenarios

## Implementation Notes

### Performance Considerations

1. **Zero-Cost Abstraction**: SilentLogger methods are no-ops, ensuring zero performance impact when debug mode is disabled
2. **No String Formatting**: Avoid expensive string operations in SilentLogger
3. **Lazy Evaluation**: Don't compute log messages if logger is silent

### Backward Compatibility

The debug mode feature is purely additive:
- Existing CLI options remain unchanged
- Default behavior (no debug output) is preserved
- No breaking changes to existing APIs or interfaces

### Future Enhancements

Potential future improvements:
1. **Log Levels**: Add different verbosity levels (INFO, DEBUG, TRACE)
2. **Log Output**: Support logging to file instead of console
3. **Structured Logging**: Output logs in JSON format for parsing
4. **Performance Metrics**: Add timing information to debug output
