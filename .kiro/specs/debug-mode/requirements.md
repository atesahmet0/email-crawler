# Requirements Document

## Introduction

This document specifies the requirements for adding a debug mode to the email extraction crawler. The debug mode will provide detailed visibility into the crawling process, including which URLs are being visited, which emails are discovered, filtering decisions, and other operational details. This feature will help users understand the crawler's behavior and troubleshoot issues during email extraction.

## Glossary

- **Crawler**: The system component that recursively visits web pages starting from a seed URL
- **Debug Mode**: An operational mode that outputs detailed diagnostic information during execution
- **Extraction Result**: A data structure containing an email address and its source URL
- **Visited URL**: A URL that the Crawler has already processed
- **Queue**: The collection of URLs pending processing by the Crawler
- **Deduplication**: The process of removing duplicate email addresses from results
- **Crawl Depth**: The number of link hops from the starting URL

## Requirements

### Requirement 1

**User Story:** As a user, I want to enable debug mode via a command-line flag, so that I can see detailed crawling information when needed.

#### Acceptance Criteria

1. WHEN a user provides the debug flag in the command-line arguments THEN the Crawler SHALL activate debug mode
2. WHEN debug mode is not specified THEN the Crawler SHALL operate in normal mode without debug output
3. WHEN the debug flag is provided THEN the system SHALL display a message confirming debug mode is active

### Requirement 2

**User Story:** As a user, I want to see which URLs are being crawled, so that I can understand the crawler's path through the website.

#### Acceptance Criteria

1. WHEN the Crawler visits a URL THEN the system SHALL display the URL being processed
2. WHEN displaying a visited URL THEN the system SHALL include the current crawl depth
3. WHEN the Crawler skips a URL due to it being already visited THEN the system SHALL display a message indicating the URL was skipped
4. WHEN the Crawler skips a URL due to depth limits THEN the system SHALL display a message indicating the depth limit was reached

### Requirement 3

**User Story:** As a user, I want to see which emails are discovered on each page, so that I can verify the extraction is working correctly.

#### Acceptance Criteria

1. WHEN the Crawler extracts emails from a page THEN the system SHALL display each discovered email address
2. WHEN displaying discovered emails THEN the system SHALL include the source URL where each email was found
3. WHEN no emails are found on a page THEN the system SHALL display a message indicating zero emails were extracted
4. WHEN multiple emails are found on a single page THEN the system SHALL display the count of emails found

### Requirement 4

**User Story:** As a user, I want to see filtering and deduplication decisions, so that I can understand why certain emails are included or excluded from the final results.

#### Acceptance Criteria

1. WHEN an email is filtered during deduplication THEN the system SHALL display a message indicating the email was a duplicate
2. WHEN displaying duplicate emails THEN the system SHALL show both the duplicate email and the reason for filtering
3. WHEN the final deduplication process runs THEN the system SHALL display the count of emails before and after deduplication

### Requirement 5

**User Story:** As a user, I want to see HTTP request information, so that I can diagnose connectivity or response issues.

#### Acceptance Criteria

1. WHEN the Crawler fetches a URL THEN the system SHALL display the HTTP status code received
2. WHEN an HTTP request fails THEN the system SHALL display the error message
3. WHEN a non-success HTTP status is received THEN the system SHALL display a message indicating the page was skipped

### Requirement 6

**User Story:** As a user, I want to see link discovery information, so that I can understand how the crawler finds new pages to visit.

#### Acceptance Criteria

1. WHEN the Crawler discovers links on a page THEN the system SHALL display the count of links found
2. WHEN links are filtered by domain THEN the system SHALL display the count of same-domain links
3. WHEN new links are added to the queue THEN the system SHALL display the count of links added

### Requirement 7

**User Story:** As a user, I want debug output to be clearly formatted and distinguishable from normal output, so that I can easily read and understand the information.

#### Acceptance Criteria

1. WHEN debug mode is active THEN the system SHALL prefix all debug messages with a consistent identifier
2. WHEN displaying debug information THEN the system SHALL use clear formatting with appropriate spacing
3. WHEN displaying different types of debug information THEN the system SHALL use visual indicators to distinguish message types
