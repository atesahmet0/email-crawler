/**
 * Deduplicator Module
 * Removes duplicate email addresses using case-insensitive comparison
 * Supports checking against existing emails from file
 */

import { ExtractionResult } from './csv-writer.js';

export interface Deduplicator {
  deduplicate(results: ExtractionResult[], existingEmails?: string[]): ExtractionResult[];
}

/**
 * Removes duplicate emails from extraction results using case-insensitive comparison
 * @param results - Array of extraction results to deduplicate
 * @param existingEmails - Optional array of existing emails to check against
 * @returns Array of unique extraction results
 */
export function deduplicate(
  results: ExtractionResult[], 
  existingEmails?: string[]
): ExtractionResult[] {
  // Create a set of lowercase emails for case-insensitive comparison
  const seenEmails = new Set<string>();
  
  // Add existing emails to the set (case-insensitive)
  if (existingEmails) {
    existingEmails.forEach(email => {
      seenEmails.add(email.toLowerCase());
    });
  }
  
  // Filter results, keeping only unique emails (case-insensitive)
  const uniqueResults: ExtractionResult[] = [];
  
  for (const result of results) {
    const emailLower = result.email.toLowerCase();
    
    if (!seenEmails.has(emailLower)) {
      seenEmails.add(emailLower);
      uniqueResults.push(result);
    }
  }
  
  return uniqueResults;
}

export class DeduplicatorImpl implements Deduplicator {
  deduplicate(results: ExtractionResult[], existingEmails?: string[]): ExtractionResult[] {
    return deduplicate(results, existingEmails);
  }
}

export const deduplicator = new DeduplicatorImpl();
