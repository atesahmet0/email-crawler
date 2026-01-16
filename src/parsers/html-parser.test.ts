/**
 * Tests for HTML Parser Module
 */

import { describe, it, expect } from 'bun:test';
import { parse } from './html-parser';

describe('HTML Parser', () => {
  it('should extract text content from valid HTML', () => {
    const html = '<html><body><p>Hello World</p></body></html>';
    const result = parse(html);
    
    expect(result.textContent).toContain('Hello World');
  });

  it('should extract links from anchor tags', () => {
    const html = '<html><body><a href="https://example.com">Link</a></body></html>';
    const result = parse(html);
    
    expect(result.links).toContain('https://example.com');
  });

  it('should extract multiple links', () => {
    const html = `
      <html><body>
        <a href="https://example.com/page1">Link 1</a>
        <a href="https://example.com/page2">Link 2</a>
        <a href="/relative">Link 3</a>
      </body></html>
    `;
    const result = parse(html);
    
    expect(result.links).toHaveLength(3);
    expect(result.links).toContain('https://example.com/page1');
    expect(result.links).toContain('https://example.com/page2');
    expect(result.links).toContain('/relative');
  });

  it('should handle malformed HTML gracefully', () => {
    const html = '<html><body><p>Unclosed paragraph<a href="/link">Link</body>';
    const result = parse(html);
    
    expect(result.textContent).toContain('Unclosed paragraph');
    expect(result.links).toContain('/link');
  });

  it('should return empty results for empty HTML', () => {
    const result = parse('');
    
    expect(result.textContent).toBe('');
    expect(result.links).toHaveLength(0);
  });

  it('should ignore anchor tags without href attribute', () => {
    const html = '<html><body><a>No href</a><a href="/valid">Valid</a></body></html>';
    const result = parse(html);
    
    expect(result.links).toHaveLength(1);
    expect(result.links).toContain('/valid');
  });
});
