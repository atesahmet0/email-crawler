# Email Extractor

A command-line tool that recursively crawls websites to extract email addresses and saves them to a CSV file.

## Features

- Recursively crawls websites following same-domain links
- Extracts email addresses in various formats
- Configurable crawl depth
- Deduplicates results (case-insensitive)
- Outputs to CSV format
- Appends to existing files without duplicating headers

## Installation

```bash
bun install
bun run build
```

## Usage

After building, you can run the tool using:

```bash
node dist/index.js --url <website-url> --output <output-file.csv> [--depth <max-depth>]
```

Or using the npm script:

```bash
bun start -- --url <website-url> --output <output-file.csv> [--depth <max-depth>]
```

### Examples

Extract emails from a website with default depth (3):
```bash
node dist/index.js --url https://example.com --output emails.csv
```

Extract emails with custom depth:
```bash
node dist/index.js --url https://example.com --output emails.csv --depth 5
```

### Options

- `-u, --url <url>`: Target website URL to crawl (required)
- `-o, --output <file>`: Output CSV file path (required)
- `-d, --depth <number>`: Maximum crawl depth (default: 3)
- `-h, --help`: Display help information
- `-V, --version`: Display version number

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
