# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Initialize Node.js project with TypeScript configuration
  - Install dependencies: node-fetch, cheerio, commander
  - Install dev dependencies: vitest, fast-check, @types packages
  - Configure tsconfig.json and package.json scripts
  - _Requirements: All_

- [ ] 2. Implement URL validation
  - [ ] 2.1 Create URL validator module
    - Implement isValid() to check URL format
    - Implement getDomain() to extract domain from URL
    - Implement isSameDomain() for domain comparison
    - Implement normalizeURL() to standardize URLs
    - _Requirements: 1.2, 2.1_
  - [ ]* 2.2 Write property test for URL validation
    - **Property 1: Invalid URL Rejection**
    - **Validates: Requirements 1.2**

- [ ] 3. Implement email extraction
  - [ ] 3.1 Create email extractor module
    - Implement RFC 5321 compliant email regex pattern
    - Implement extract() to find all emails in text
    - Implement isValidEmail() for individual validation
    - Handle standard formats, subdomains, and special characters
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ]* 3.2 Write property test for valid email extraction
    - **Property 2: Valid Email Extraction**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  - [ ]* 3.3 Write property test for invalid email rejection
    - **Property 3: Invalid Email Rejection**
    - **Validates: Requirements 3.4**

- [ ] 4. Implement HTML parsing and link discovery
  - [ ] 4.1 Create HTML parser module using cheerio
    - Implement parse() to extract text content and links
    - Handle malformed HTML gracefully
    - _Requirements: 2.1_
  - [ ] 4.2 Create link discovery module
    - Implement discoverLinks() to filter same-domain links
    - Handle relative URL conversion to absolute
    - _Requirements: 2.1, 2.2_
  - [ ]* 4.3 Write property test for same-domain link discovery
    - **Property 4: Same-Domain Link Discovery**
    - **Validates: Requirements 2.1**

- [ ] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement CSV output
  - [ ] 6.1 Create CSV writer module
    - Implement serialize() with proper escaping for commas, quotes, newlines
    - Implement parse() to read CSV back to ExtractionResult[]
    - Implement write() for file output with header
    - Implement append mode that skips header
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [ ]* 6.2 Write property test for CSV round-trip
    - **Property 7: CSV Round-Trip**
    - **Validates: Requirements 4.5, 4.6**
  - [ ]* 6.3 Write property test for CSV row count
    - **Property 8: CSV Row Count**
    - **Validates: Requirements 4.3**

- [ ] 7. Implement deduplication
  - [ ] 7.1 Create deduplicator module
    - Implement deduplicate() with case-insensitive comparison
    - Support checking against existing emails from file
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]* 7.2 Write property test for case-insensitive deduplication
    - **Property 9: Case-Insensitive Deduplication**
    - **Validates: Requirements 5.1, 5.3**

- [ ] 8. Implement HTTP client
  - [ ] 8.1 Create HTTP client module using node-fetch
    - Implement fetch() with error handling
    - Handle timeouts and connection failures
    - Return structured HTTPResponse
    - _Requirements: 1.1, 1.3_

- [ ] 9. Implement crawler engine
  - [ ] 9.1 Create crawler engine module
    - Implement crawl() with queue management
    - Track visited URLs to prevent re-processing
    - Enforce depth limits with default of 3
    - Coordinate all components
    - _Requirements: 1.1, 1.4, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 9.2 Write property test for visited URL tracking
    - **Property 5: Visited URL Tracking**
    - **Validates: Requirements 2.3**
  - [ ]* 9.3 Write property test for depth limiting
    - **Property 6: Depth Limiting**
    - **Validates: Requirements 2.4**

- [ ] 10. Implement CLI interface
  - [ ] 10.1 Create CLI module using commander
    - Parse url, output, and depth arguments
    - Display progress messages
    - Display completion summary with email count
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 10.2 Create main entry point
    - Wire all components together
    - Handle errors and display appropriate messages
    - _Requirements: All_

- [ ] 11. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
