/**
 * Deduplicator Module
 * Removes duplicate email addresses using case-insensitive comparison
 * Supports checking against existing emails from file
 */

import { ExtractionResult } from './csv-writer.js';
import { Logger } from '../logger/logger.js';

export interface Deduplicator {
  deduplicate(results: ExtractionResult[], existingEmails?: string[], logger?: Logger): ExtractionResult[];
}

/**
 * Removes duplicate emails from extraction results using case-insensitive comparison
 * @param results - Array of extraction results to deduplicate
 * @param existingEmails - Optional array of existing emails to check against
 * @param logger - Optional logger for debug output
 * @returns Array of unique extraction results
 */
export function deduplicate(
  results: ExtractionResult[], 
  existingEmails?: string[],
  logger?: Logger
): ExtractionResult[] {
  const beforeCount = results.length;
  
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
    } else {
      // Log duplicate email if logger is provided
      logger?.logDuplicateEmail(result.email);
    }
  }
  
  const afterCount = uniqueResults.length;
  
  // Log deduplication summary if logger is provided
  logger?.logDeduplicationSummary(beforeCount, afterCount);
  
  return uniqueResults;
}

export class DeduplicatorImpl implements Deduplicator {
  deduplicate(results: ExtractionResult[], existingEmails?: string[], logger?: Logger): ExtractionResult[] {
    return deduplicate(results, existingEmails, logger);
  }
}

export const deduplicator = new DeduplicatorImpl();
