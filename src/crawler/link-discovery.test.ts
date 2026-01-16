/**
 * Tests for Link Discovery Module
 */

import { describe, it, expect } from 'bun:test';
import { discoverLinks } from './link-discovery';

describe('Link Discovery', () => {
  const baseDomain = 'example.com';
  const baseURL = 'https://example.com/page';

  it('should filter same-domain absolute links', () => {
    const links = [
      'https://example.com/page1',
      'https://other.com/page2',
      'https://example.com/page3',
    ];

    const result = discoverLinks(links, baseDomain, baseURL);

    expect(result).toHaveLength(2);
    expect(result).toContain('https://example.com/page1');
    expect(result).toContain('https://example.com/page3');
    expect(result).not.toContain('https://other.com/page2');
  });

  it('should convert relative URLs to absolute', () => {
    const links = ['/about', '/contact', 'team'];

    const result = discoverLinks(links, baseDomain, baseURL);

    expect(result).toHaveLength(3);
    expect(result).toContain('https://example.com/about');
    expect(result).toContain('https://example.com/contact');
    expect(result).toContain('https://example.com/team');
  });

  it('should handle mixed relative and absolute URLs', () => {
    const links = [
      'https://example.com/absolute',
      '/relative',
      'https://other.com/external',
      '../parent',
    ];

    const result = discoverLinks(links, baseDomain, baseURL);

    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('https://example.com/absolute');
    expect(result).toContain('https://example.com/relative');
    expect(result).not.toContain('https://other.com/external');
  });

  it('should deduplicate links', () => {
    const links = [
      'https://example.com/page1',
      'https://example.com/page1',
      '/page1',
    ];

    const result = discoverLinks(links, baseDomain, baseURL);

    // Should only have one instance of page1
    expect(result).toHaveLength(1);
    expect(result).toContain('https://example.com/page1');
  });

  it('should handle empty link array', () => {
    const result = discoverLinks([], baseDomain, baseURL);

    expect(result).toHaveLength(0);
  });

  it('should ignore non-http/https protocols', () => {
    const links = [
      'mailto:test@example.com',
      'javascript:void(0)',
      'ftp://example.com/file',
      'https://example.com/valid',
    ];

    const result = discoverLinks(links, baseDomain, baseURL);

    expect(result).toHaveLength(1);
    expect(result).toContain('https://example.com/valid');
  });

  it('should handle hash fragments and query parameters', () => {
    const links = [
      'https://example.com/page#section',
      'https://example.com/page?query=1',
      '/page#another',
    ];

    const result = discoverLinks(links, baseDomain, baseURL);

    expect(result.length).toBeGreaterThan(0);
    // All should be included as they're same domain
    expect(result.every(link => link.includes('example.com'))).toBe(true);
  });

  it('should handle subdomain differences', () => {
    const links = [
      'https://example.com/page1',
      'https://www.example.com/page2',
      'https://blog.example.com/page3',
    ];

    const result = discoverLinks(links, baseDomain, baseURL);

    // Only exact domain match should be included
    expect(result).toHaveLength(1);
    expect(result).toContain('https://example.com/page1');
  });

  it('should allow cross-domain links when crossDomain is true', () => {
    const links = [
      'https://example.com/page1',
      'https://other.com/page2',
      'https://another.com/page3',
    ];

    const result = discoverLinks(links, baseDomain, baseURL, true);

    expect(result).toHaveLength(3);
    expect(result).toContain('https://example.com/page1');
    expect(result).toContain('https://other.com/page2');
    expect(result).toContain('https://another.com/page3');
  });

  it('should still filter same-domain when crossDomain is false', () => {
    const links = [
      'https://example.com/page1',
      'https://other.com/page2',
    ];

    const result = discoverLinks(links, baseDomain, baseURL, false);

    expect(result).toHaveLength(1);
    expect(result).toContain('https://example.com/page1');
  });
});
