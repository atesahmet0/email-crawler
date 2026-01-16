import { describe, test, expect } from 'bun:test';
import { isValid, getDomain, isSameDomain, normalizeURL } from './url-validator';

describe('URL Validator', () => {
  describe('isValid', () => {
    test('accepts valid http URLs', () => {
      expect(isValid('http://example.com')).toBe(true);
      expect(isValid('http://www.example.com/path')).toBe(true);
    });

    test('accepts valid https URLs', () => {
      expect(isValid('https://example.com')).toBe(true);
      expect(isValid('https://www.example.com/path')).toBe(true);
    });

    test('rejects URLs without protocol', () => {
      expect(isValid('example.com')).toBe(false);
      expect(isValid('www.example.com')).toBe(false);
    });

    test('rejects malformed URLs', () => {
      expect(isValid('not a url')).toBe(false);
      expect(isValid('http://')).toBe(false);
      expect(isValid('')).toBe(false);
    });

    test('rejects non-http(s) protocols', () => {
      expect(isValid('ftp://example.com')).toBe(false);
      expect(isValid('file:///path/to/file')).toBe(false);
    });
  });

  describe('getDomain', () => {
    test('extracts domain from valid URLs', () => {
      expect(getDomain('http://example.com')).toBe('example.com');
      expect(getDomain('https://www.example.com/path')).toBe('www.example.com');
      expect(getDomain('http://subdomain.example.com:8080/path')).toBe('subdomain.example.com');
    });

    test('returns empty string for invalid URLs', () => {
      expect(getDomain('not a url')).toBe('');
      expect(getDomain('')).toBe('');
    });
  });

  describe('isSameDomain', () => {
    test('returns true for same domains', () => {
      expect(isSameDomain('http://example.com', 'http://example.com/path')).toBe(true);
      expect(isSameDomain('https://example.com', 'http://example.com')).toBe(true);
      expect(isSameDomain('http://example.com:8080', 'http://example.com:9090')).toBe(true);
    });

    test('returns false for different domains', () => {
      expect(isSameDomain('http://example.com', 'http://other.com')).toBe(false);
      expect(isSameDomain('http://sub.example.com', 'http://example.com')).toBe(false);
    });

    test('returns false when either URL is invalid', () => {
      expect(isSameDomain('not a url', 'http://example.com')).toBe(false);
      expect(isSameDomain('http://example.com', 'not a url')).toBe(false);
      expect(isSameDomain('not a url', 'also not a url')).toBe(false);
    });
  });

  describe('normalizeURL', () => {
    test('converts hostname to lowercase', () => {
      expect(normalizeURL('http://EXAMPLE.COM')).toBe('http://example.com/');
      expect(normalizeURL('http://Example.Com/Path')).toBe('http://example.com/Path');
    });

    test('removes trailing slashes from paths', () => {
      expect(normalizeURL('http://example.com/path/')).toBe('http://example.com/path');
      expect(normalizeURL('http://example.com/')).toBe('http://example.com/');
    });

    test('removes default ports', () => {
      expect(normalizeURL('http://example.com:80')).toBe('http://example.com/');
      expect(normalizeURL('https://example.com:443')).toBe('https://example.com/');
    });

    test('keeps non-default ports', () => {
      expect(normalizeURL('http://example.com:8080')).toContain(':8080');
      expect(normalizeURL('https://example.com:8443')).toContain(':8443');
    });

    test('sorts query parameters', () => {
      const normalized = normalizeURL('http://example.com?z=1&a=2&m=3');
      expect(normalized).toBe('http://example.com/?a=2&m=3&z=1');
    });

    test('returns invalid URLs as-is', () => {
      expect(normalizeURL('not a url')).toBe('not a url');
    });
  });
});
