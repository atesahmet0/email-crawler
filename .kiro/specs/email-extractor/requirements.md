# Requirements Document

## Introduction

This document specifies the requirements for an Email Extractor tool that recursively crawls websites to identify and extract company email addresses, then saves them to a CSV file. The tool will parse HTML content, follow links within the same domain, identify email patterns, and store the results in a structured format.

## Glossary

- **Email Extractor**: The system that crawls web pages and extracts email addresses from their content
- **Target URL**: The starting web page URL provided by the user for email extraction
- **Crawl Depth**: The maximum number of link levels to follow from the target URL
- **Same-Domain Link**: A hyperlink that points to another page within the same domain as the target URL
- **Email Pattern**: A regular expression or pattern used to identify valid email addresses in text content
- **Extraction Result**: The collection of email addresses found across all crawled pages along with metadata
- **Output File**: The CSV file where extracted email addresses are saved

## Requirements

### Requirement 1

**User Story:** As a user, I want to provide a website URL and have the tool recursively crawl and extract all email addresses, so that I can collect contact information from an entire website efficiently.

#### Acceptance Criteria

1. WHEN a user provides a valid URL THEN the Email Extractor SHALL fetch the web page content and extract all email addresses found
2. WHEN a user provides an invalid URL THEN the Email Extractor SHALL return an error message indicating the URL is malformed
3. WHEN the target URL is unreachable THEN the Email Extractor SHALL return an error message indicating the connection failure
4. WHEN the web page contains no email addresses THEN the Email Extractor SHALL continue crawling other pages and report the final count

### Requirement 2

**User Story:** As a user, I want the tool to automatically follow links and crawl multiple pages within the same domain, so that I can extract emails from an entire website without manually entering each URL.

#### Acceptance Criteria

1. WHEN processing a page THEN the Email Extractor SHALL identify all hyperlinks pointing to the same domain
2. WHEN same-domain links are found THEN the Email Extractor SHALL add them to the crawl queue for processing
3. WHEN crawling THEN the Email Extractor SHALL track visited URLs and skip pages already processed
4. WHEN a user specifies a maximum crawl depth THEN the Email Extractor SHALL limit recursion to that depth
5. WHEN no crawl depth is specified THEN the Email Extractor SHALL use a default maximum depth of 3 levels

### Requirement 3

**User Story:** As a user, I want the tool to accurately identify email addresses in various formats, so that I don't miss any contact information.

#### Acceptance Criteria

1. WHEN parsing page content THEN the Email Extractor SHALL identify standard email formats (e.g., name@domain.com)
2. WHEN parsing page content THEN the Email Extractor SHALL identify emails with subdomains (e.g., name@mail.company.com)
3. WHEN parsing page content THEN the Email Extractor SHALL identify emails with special characters in the local part (e.g., first.last@domain.com, first+tag@domain.com)
4. WHEN parsing page content THEN the Email Extractor SHALL ignore invalid email patterns that do not conform to RFC 5321 basic format

### Requirement 4

**User Story:** As a user, I want to save extracted emails to a CSV file, so that I can easily import them into other tools for outreach or analysis.

#### Acceptance Criteria

1. WHEN extraction completes successfully THEN the Email Extractor SHALL save results to a CSV file at the specified path
2. WHEN saving results THEN the Email Extractor SHALL include a header row with column names (email, source_url)
3. WHEN saving results THEN the Email Extractor SHALL store each email on a separate row with its source URL
4. WHEN the output file already exists THEN the Email Extractor SHALL append new results without overwriting existing data or duplicating the header
5. WHEN serializing extraction results to CSV THEN the Email Extractor SHALL properly escape special characters (commas, quotes, newlines)
6. WHEN parsing a CSV file THEN the Email Extractor SHALL correctly reconstruct the email and source URL data

### Requirement 5

**User Story:** As a user, I want to avoid duplicate emails in my results, so that my contact list remains clean and organized.

#### Acceptance Criteria

1. WHEN multiple instances of the same email are found on a page THEN the Email Extractor SHALL store only one instance
2. WHEN appending to an existing output file THEN the Email Extractor SHALL check for duplicates and skip emails already present
3. WHEN comparing emails for duplicates THEN the Email Extractor SHALL perform case-insensitive comparison

### Requirement 6

**User Story:** As a user, I want to see progress and results of the extraction, so that I know the tool is working and what was found.

#### Acceptance Criteria

1. WHEN extraction begins THEN the Email Extractor SHALL display a message indicating the target URL being processed
2. WHEN extraction completes THEN the Email Extractor SHALL display the count of emails found
3. WHEN emails are saved THEN the Email Extractor SHALL display the output file path and confirmation message
