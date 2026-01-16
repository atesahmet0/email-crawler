# Requirements Document

## Introduction

This feature enables the email extractor to crawl across multiple domains, not just the starting domain. Currently, the crawler only follows links within the same domain as the starting URL. This enhancement adds a command-line flag that allows users to enable cross-domain crawling, expanding the scope of email extraction to linked external websites.

## Glossary

- **Email Extractor**: The command-line application that crawls websites and extracts email addresses
- **Cross-Domain Crawling**: The ability to follow and crawl links that point to domains different from the starting URL's domain
- **Same-Domain Crawling**: The current behavior where only links within the starting domain are followed
- **CLI**: Command-Line Interface, the user-facing interface for configuring and running the application
- **Crawler Engine**: The core component that manages the crawling process, queue, and visited URL tracking
- **Link Discovery**: The component responsible for identifying and filtering links from parsed HTML pages

## Requirements

### Requirement 1

**User Story:** As a user, I want to enable cross-domain crawling via a command-line flag, so that I can extract emails from websites linked to my starting URL across different domains.

#### Acceptance Criteria

1. WHEN a user provides the cross-domain flag in the CLI THEN the Email Extractor SHALL accept and parse the flag without errors
2. WHEN the cross-domain flag is not provided THEN the Email Extractor SHALL maintain the current same-domain-only crawling behavior
3. WHEN the cross-domain flag is enabled THEN the Crawler Engine SHALL follow links to any valid domain, not just the starting domain
4. WHEN the cross-domain flag is disabled THEN the Crawler Engine SHALL only follow links within the starting domain
5. WHEN cross-domain crawling is enabled THEN the Link Discovery component SHALL return all valid links regardless of domain

### Requirement 2

**User Story:** As a user, I want the cross-domain flag to be clearly documented, so that I understand how to use it and what behavior to expect.

#### Acceptance Criteria

1. WHEN a user runs the help command THEN the CLI SHALL display the cross-domain flag with a clear description
2. WHEN a user reads the README THEN the documentation SHALL include examples of using the cross-domain flag
3. WHEN a user reads the README THEN the documentation SHALL explain the difference between same-domain and cross-domain crawling behavior

### Requirement 3

**User Story:** As a developer, I want the cross-domain configuration to be passed through the system cleanly, so that all components can access the setting without tight coupling.

#### Acceptance Criteria

1. WHEN the CLI parses arguments THEN the system SHALL include the cross-domain flag value in the options object
2. WHEN the Crawler Engine is initialized THEN the system SHALL provide the cross-domain configuration to the engine
3. WHEN the Link Discovery component filters links THEN the system SHALL provide the cross-domain configuration to determine filtering behavior
4. WHEN components access the cross-domain setting THEN the system SHALL maintain consistent behavior across all components

### Requirement 4

**User Story:** As a user, I want cross-domain crawling to respect depth limits, so that the crawler doesn't run indefinitely across the internet.

#### Acceptance Criteria

1. WHEN cross-domain crawling is enabled and a depth limit is set THEN the Crawler Engine SHALL enforce the depth limit across all domains
2. WHEN a cross-domain link is discovered at maximum depth THEN the Crawler Engine SHALL not add the link to the crawl queue
3. WHEN cross-domain crawling processes multiple domains THEN the Crawler Engine SHALL track visited URLs across all domains to prevent revisiting
