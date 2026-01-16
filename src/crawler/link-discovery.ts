/**
 * Link Discovery Module
 * Filters and processes links to discover same-domain URLs for crawling
 */

import { getDomain, isValid } from '../validators/url-validator';

export interface LinkDiscovery {
  discoverLinks(links: string[], baseDomain: string, baseURL: string): string[];
}

/**
 * Discovers same-domain links from a list of URLs
 * Converts relative URLs to absolute and filters to same-domain only
 * 
 * @param links - Array of URLs (can be relative or absolute)
 * @param baseDomain - The domain to filter for (e.g., "example.com")
 * @param baseURL - The base URL to resolve relative links against
 * @returns Array of absolute URLs that belong to the same domain
 */
export function discoverLinks(
  links: string[],
  baseDomain: string,
  baseURL: string
): string[] {
  const discoveredLinks: string[] = [];
  const seenLinks = new Set<string>();

  for (const link of links) {
    try {
      // Convert relative URLs to absolute using the base URL
      const absoluteURL = new URL(link, baseURL);
      const absoluteURLString = absoluteURL.toString();

      // Check if it's a valid URL (http/https only)
      if (!isValid(absoluteURLString)) {
        continue;
      }

      // Get the domain of this link
      const linkDomain = getDomain(absoluteURLString);

      // Only include if it's the same domain and we haven't seen it yet
      if (linkDomain === baseDomain && !seenLinks.has(absoluteURLString)) {
        discoveredLinks.push(absoluteURLString);
        seenLinks.add(absoluteURLString);
      }
    } catch {
      // Skip invalid URLs that can't be parsed
      continue;
    }
  }

  return discoveredLinks;
}

// Export as default object implementing the interface
export const linkDiscovery: LinkDiscovery = {
  discoverLinks,
};
