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

```bash
bun start -- --url <website-url> --output <output-file.csv> [--depth <max-depth>]
```

### Options

- `--url`: Target website URL to crawl (required)
- `--output`: Output CSV file path (required)
- `--depth`: Maximum crawl depth (default: 3)

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
├── validators/       # URL validation
├── extractors/       # Email extraction
├── parsers/          # HTML parsing
├── crawler/          # Crawl engine and link discovery
├── output/           # CSV writing and deduplication
└── index.ts          # Main entry point
```

## Requirements

- Bun 1.0+
- TypeScript 5+
