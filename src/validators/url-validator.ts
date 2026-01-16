/**
 * URL Validator Module
 * Provides utilities for validating, parsing, and comparing URLs
 */

export interface URLValidator {
  isValid(url: string): boolean;
  getDomain(url: string): string;
  isSameDomain(url1: string, url2: string): boolean;
  normalizeURL(url: string): string;
}

/**
 * Validates if a string is a valid URL with http or https protocol
 */
export function isValid(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only accept http and https protocols
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extracts the domain (hostname) from a URL
 * Returns empty string if URL is invalid
 */
export function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return '';
  }
}

/**
 * Checks if two URLs belong to the same domain
 */
export function isSameDomain(url1: string, url2: string): boolean {
  const domain1 = getDomain(url1);
  const domain2 = getDomain(url2);
  
  // Both must have valid domains
  if (!domain1 || !domain2) {
    return false;
  }
  
  return domain1 === domain2;
}

/**
 * Normalizes a URL by:
 * - Converting to lowercase hostname
 * - Removing trailing slashes
 * - Removing default ports (80 for http, 443 for https)
 * - Sorting query parameters
 */
export function normalizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Normalize hostname to lowercase
    parsed.hostname = parsed.hostname.toLowerCase();
    
    // Remove default ports
    if ((parsed.protocol === 'http:' && parsed.port === '80') ||
        (parsed.protocol === 'https:' && parsed.port === '443')) {
      parsed.port = '';
    }
    
    // Remove trailing slash from pathname (unless it's just "/")
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    
    // Sort query parameters for consistency
    if (parsed.search) {
      const params = new URLSearchParams(parsed.search);
      const sortedParams = new URLSearchParams(
        Array.from(params.entries()).sort((a, b) => a[0].localeCompare(b[0]))
      );
      parsed.search = sortedParams.toString();
    }
    
    return parsed.toString();
  } catch {
    // If URL is invalid, return as-is
    return url;
  }
}

// Export as default object implementing the interface
export const urlValidator: URLValidator = {
  isValid,
  getDomain,
  isSameDomain,
  normalizeURL,
};
