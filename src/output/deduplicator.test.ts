import { describe, it, expect } from 'bun:test';
import { deduplicate, DeduplicatorImpl, type Deduplicator } from './deduplicator';
import type { ExtractionResult } from './csv-writer';

describe('Deduplicator', () => {
  const deduplicatorInstance: Deduplicator = new DeduplicatorImpl();

  describe('deduplicate function', () => {
    it('should remove duplicate emails (case-insensitive)', () => {
      const results: ExtractionResult[] = [
        { email: 'test@example.com', sourceURL: 'https://example.com/page1' },
        { email: 'Test@Example.com', sourceURL: 'https://example.com/page2' },
        { email: 'TEST@EXAMPLE.COM', sourceURL: 'https://example.com/page3' },
        { email: 'info@test.com', sourceURL: 'https://test.com' }
      ];

      const unique = deduplicate(results);

      expect(unique.length).toBe(2);
      expect(unique[0].email).toBe('test@example.com');
      expect(unique[1].email).toBe('info@test.com');
    });

    it('should keep first occurrence when duplicates exist', () => {
      const results: ExtractionResult[] = [
        { email: 'first@example.com', sourceURL: 'https://example.com/page1' },
        { email: 'FIRST@EXAMPLE.COM', sourceURL: 'https://example.com/page2' }
      ];

      const unique = deduplicate(results);

      expect(unique.length).toBe(1);
      expect(unique[0].sourceURL).toBe('https://example.com/page1');
    });

    it('should handle empty results array', () => {
      const results: ExtractionResult[] = [];
      const unique = deduplicate(results);

      expect(unique).toEqual([]);
    });

    it('should handle results with no duplicates', () => {
      const results: ExtractionResult[] = [
        { email: 'one@example.com', sourceURL: 'https://example.com/1' },
        { email: 'two@example.com', sourceURL: 'https://example.com/2' },
        { email: 'three@example.com', sourceURL: 'https://example.com/3' }
      ];

      const unique = deduplicate(results);

      expect(unique.length).toBe(3);
      expect(unique).toEqual(results);
    });

    it('should check against existing emails (case-insensitive)', () => {
      const results: ExtractionResult[] = [
        { email: 'new@example.com', sourceURL: 'https://example.com/new' },
        { email: 'existing@example.com', sourceURL: 'https://example.com/page' },
        { email: 'EXISTING@EXAMPLE.COM', sourceURL: 'https://example.com/page2' }
      ];

      const existingEmails = ['existing@example.com', 'old@example.com'];
      const unique = deduplicate(results, existingEmails);

      expect(unique.length).toBe(1);
      expect(unique[0].email).toBe('new@example.com');
    });

    it('should handle existing emails with different cases', () => {
      const results: ExtractionResult[] = [
        { email: 'test@example.com', sourceURL: 'https://example.com/page' }
      ];

      const existingEmails = ['TEST@EXAMPLE.COM'];
      const unique = deduplicate(results, existingEmails);

      expect(unique.length).toBe(0);
    });

    it('should handle empty existing emails array', () => {
      const results: ExtractionResult[] = [
        { email: 'test@example.com', sourceURL: 'https://example.com/page' }
      ];

      const unique = deduplicate(results, []);

      expect(unique.length).toBe(1);
      expect(unique[0].email).toBe('test@example.com');
    });

    it('should handle multiple duplicates within results and existing', () => {
      const results: ExtractionResult[] = [
        { email: 'new1@example.com', sourceURL: 'https://example.com/1' },
        { email: 'existing@example.com', sourceURL: 'https://example.com/2' },
        { email: 'new2@example.com', sourceURL: 'https://example.com/3' },
        { email: 'NEW1@EXAMPLE.COM', sourceURL: 'https://example.com/4' },
        { email: 'old@example.com', sourceURL: 'https://example.com/5' }
      ];

      const existingEmails = ['EXISTING@EXAMPLE.COM', 'old@example.com'];
      const unique = deduplicate(results, existingEmails);

      expect(unique.length).toBe(2);
      expect(unique[0].email).toBe('new1@example.com');
      expect(unique[1].email).toBe('new2@example.com');
    });
  });

  describe('DeduplicatorImpl class', () => {
    it('should deduplicate using class instance', () => {
      const results: ExtractionResult[] = [
        { email: 'test@example.com', sourceURL: 'https://example.com/page1' },
        { email: 'TEST@EXAMPLE.COM', sourceURL: 'https://example.com/page2' }
      ];

      const unique = deduplicatorInstance.deduplicate(results);

      expect(unique.length).toBe(1);
    });

    it('should work with existing emails using class instance', () => {
      const results: ExtractionResult[] = [
        { email: 'new@example.com', sourceURL: 'https://example.com/new' },
        { email: 'existing@example.com', sourceURL: 'https://example.com/page' }
      ];

      const existingEmails = ['EXISTING@EXAMPLE.COM'];
      const unique = deduplicatorInstance.deduplicate(results, existingEmails);

      expect(unique.length).toBe(1);
      expect(unique[0].email).toBe('new@example.com');
    });
  });
});
