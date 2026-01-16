/**
 * HTML Parser Module
 * Parses HTML content to extract text and links using cheerio
 */

import * as cheerio from 'cheerio';

export interface ParsedHTML {
  textContent: string;
  links: string[];
}

export interface HTMLParser {
  parse(html: string): ParsedHTML;
}

/**
 * Parses HTML content and extracts text content and all href links
 * Handles malformed HTML gracefully using cheerio's lenient parser
 */
export function parse(html: string): ParsedHTML {
  try {
    // Load HTML with cheerio - it handles malformed HTML gracefully
    const $ = cheerio.load(html);
    
    // Extract text content from the body (or entire document if no body)
    const textContent = $('body').length > 0 
      ? $('body').text() 
      : $.text();
    
    // Extract all href attributes from anchor tags
    const links: string[] = [];
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        links.push(href);
      }
    });
    
    return {
      textContent: textContent.trim(),
      links,
    };
  } catch (error) {
    // If parsing fails completely, return empty results
    return {
      textContent: '',
      links: [],
    };
  }
}

// Export as default object implementing the interface
export const htmlParser: HTMLParser = {
  parse,
};
