# Email Crawler

A command-line tool that recursively crawls websites to extract email addresses and saves them to a CSV file.

## Features

- Recursively crawls websites following same-domain links
- Optional cross-domain crawling mode
- Extracts email addresses in various formats
- Configurable crawl depth
- Deduplicates results (case-insensitive)
- Outputs to CSV format
- Appends to existing files without duplicating headers
- Debug mode for detailed logging

## Installation

```bash
bun install
bun run build
```

## Usage

After building, you can run the tool using:

```bash
node dist/index.js --url <website-url> --output <output-file.csv> [--depth <max-depth>] [--cross-domain] [--debug]
```

Or using the npm script:

```bash
bun start -- --url <website-url> --output <output-file.csv> [--depth <max-depth>] [--cross-domain] [--debug]
```

### Examples

Extract emails from a website with default depth (3) and page limit (100):
```bash
node dist/index.js --url https://example.com --output emails.csv
```

Extract emails with custom depth and page limit:
```bash
node dist/index.js --url https://example.com --output emails.csv --depth 5 --max-pages 50
```

Extract emails across multiple domains:
```bash
node dist/index.js --url https://example.com --output emails.csv --cross-domain
```

Extract emails with debug logging:
```bash
node dist/index.js --url https://example.com --output emails.csv --debug
```

For low-memory environments (1GB RAM or less):
```bash
node dist/index.js --url https://example.com --output emails.csv --depth 2 --max-pages 50
```

### Options

- `-u, --url <url>`: Target website URL to crawl (required)
- `-o, --output <file>`: Output CSV file path (required)
- `-d, --depth <number>`: Maximum crawl depth (default: 3)
- `-m, --max-pages <number>`: Maximum number of pages to crawl (default: 100)
- `-c, --cross-domain`: Allow crawling across different domains
- `-D, --debug`: Enable debug mode for detailed logging
- `-h, --help`: Display help information
- `-V, --version`: Display version number

## Performance & Memory

The crawler is optimized for low-memory environments:

- **Memory Management**: Automatically clears processed data from memory
- **Queue Limiting**: Prevents unbounded queue growth (max 1000 URLs in queue)
- **Page Limiting**: Default limit of 100 pages prevents excessive memory usage
- **Recommended for 1GB RAM**: Use `--depth 2 --max-pages 50` for best results
- **Event Loop Integration**: Yields control between pages to allow garbage collection

## Development

### Build

```bash
bun run build
```

### Test

```bash
bun test
```

### Test (Watch Mode)

```bash
bun test --watch
```

## Project Structure

```
src/
├── cli/              # Command-line interface
├── validators/       # URL validation
├── extractors/       # Email extraction
├── parsers/          # HTML parsing
├── crawler/          # Crawl engine and link discovery
├── client/           # HTTP client
├── output/           # CSV writing and deduplication
└── index.ts          # Main entry point
```

## Requirements

- Bun 1.0+
- TypeScript 5+
