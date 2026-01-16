import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { CSVWriterImpl, type ExtractionResult } from './csv-writer';
import { existsSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('CSVWriter', () => {
  const csvWriter = new CSVWriterImpl();
  const testDir = join(process.cwd(), 'test-output');
  const testFile = join(testDir, 'test-output.csv');

  beforeEach(() => {
    // Create test directory if it doesn't exist
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
    
    // Clean up test file if it exists
    if (existsSync(testFile)) {
      unlinkSync(testFile);
    }
  });

  afterEach(() => {
    // Clean up test file
    if (existsSync(testFile)) {
      unlinkSync(testFile);
    }
  });

  describe('write', () => {
    it('should write results with header when not appending', async () => {
      const results: ExtractionResult[] = [
        { email: 'test@example.com', sourceURL: 'https://example.com' },
        { email: 'info@test.com', sourceURL: 'https://test.com' }
      ];

      await csvWriter.write(results, testFile, false);

      expect(existsSync(testFile)).toBe(true);
      
      const readResults = await csvWriter.read(testFile);
      expect(readResults).toEqual(results);
    });

    it('should append results without header when appending', async () => {
      const initialResults: ExtractionResult[] = [
        { email: 'first@example.com', sourceURL: 'https://example.com/1' }
      ];
      
      const appendResults: ExtractionResult[] = [
        { email: 'second@example.com', sourceURL: 'https://example.com/2' }
      ];

      await csvWriter.write(initialResults, testFile, false);
      await csvWriter.write(appendResults, testFile, true);

      const allResults = await csvWriter.read(testFile);
      expect(allResults).toEqual([...initialResults, ...appendResults]);
    });

    it('should handle special characters in emails and URLs', async () => {
      const results: ExtractionResult[] = [
        { email: 'test+tag@example.com', sourceURL: 'https://example.com/page?param=value' },
        { email: 'first.last@sub.domain.com', sourceURL: 'https://example.com/path,with,commas' }
      ];

      await csvWriter.write(results, testFile, false);
      
      const readResults = await csvWriter.read(testFile);
      expect(readResults).toEqual(results);
    });

    it('should handle emails with quotes and commas', async () => {
      const results: ExtractionResult[] = [
        { email: 'test@example.com', sourceURL: 'https://example.com/page?q="quoted,value"' }
      ];

      await csvWriter.write(results, testFile, false);
      
      const readResults = await csvWriter.read(testFile);
      expect(readResults).toEqual(results);
    });
  });

  describe('read', () => {
    it('should return empty array for non-existent file', async () => {
      const results = await csvWriter.read('non-existent-file.csv');
      expect(results).toEqual([]);
    });

    it('should return empty array for empty file', async () => {
      await csvWriter.write([], testFile, false);
      const results = await csvWriter.read(testFile);
      expect(results).toEqual([]);
    });

    it('should correctly parse CSV with multiple rows', async () => {
      const results: ExtractionResult[] = [
        { email: 'one@example.com', sourceURL: 'https://example.com/1' },
        { email: 'two@example.com', sourceURL: 'https://example.com/2' },
        { email: 'three@example.com', sourceURL: 'https://example.com/3' }
      ];

      await csvWriter.write(results, testFile, false);
      const readResults = await csvWriter.read(testFile);
      
      expect(readResults.length).toBe(3);
      expect(readResults).toEqual(results);
    });
  });
});
