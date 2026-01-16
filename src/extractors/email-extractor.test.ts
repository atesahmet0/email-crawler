import { describe, it, expect } from 'bun:test';
import { extract, isValidEmail } from './email-extractor';

describe('Email Extractor', () => {
  describe('isValidEmail', () => {
    it('should validate standard email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test@domain.org')).toBe(true);
      expect(isValidEmail('admin@company.net')).toBe(true);
    });

    it('should validate emails with subdomains', () => {
      expect(isValidEmail('user@mail.example.com')).toBe(true);
      expect(isValidEmail('admin@support.company.co.uk')).toBe(true);
    });

    it('should validate emails with special characters in local part', () => {
      expect(isValidEmail('first.last@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
      expect(isValidEmail('first_last@example.com')).toBe(true);
      expect(isValidEmail('user-name@example.com')).toBe(true);
      expect(isValidEmail('first.last+tag@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@@example.com')).toBe(false);
      expect(isValidEmail('user@example')).toBe(false);
      expect(isValidEmail('.user@example.com')).toBe(false);
      expect(isValidEmail('user.@example.com')).toBe(false);
      expect(isValidEmail('user..name@example.com')).toBe(false);
      expect(isValidEmail('user@.example.com')).toBe(false);
      expect(isValidEmail('user@example..com')).toBe(false);
    });
  });

  describe('extract', () => {
    it('should extract standard email formats from text', () => {
      const text = 'Contact us at info@example.com or support@example.com';
      const emails = extract(text);
      expect(emails).toContain('info@example.com');
      expect(emails).toContain('support@example.com');
      expect(emails.length).toBe(2);
    });

    it('should extract emails with subdomains', () => {
      const text = 'Email: admin@mail.company.com';
      const emails = extract(text);
      expect(emails).toContain('admin@mail.company.com');
    });

    it('should extract emails with special characters', () => {
      const text = 'Reach out to first.last@example.com or user+tag@example.com';
      const emails = extract(text);
      expect(emails).toContain('first.last@example.com');
      expect(emails).toContain('user+tag@example.com');
    });

    it('should return empty array for text with no emails', () => {
      const text = 'This text has no email addresses';
      const emails = extract(text);
      expect(emails).toEqual([]);
    });

    it('should deduplicate emails in the same text', () => {
      const text = 'Contact info@example.com or info@example.com again';
      const emails = extract(text);
      expect(emails).toEqual(['info@example.com']);
    });

    it('should handle empty or invalid input', () => {
      expect(extract('')).toEqual([]);
      expect(extract(null as any)).toEqual([]);
      expect(extract(undefined as any)).toEqual([]);
    });

    it('should ignore invalid email patterns', () => {
      const text = 'Invalid: @example.com, user@, user@@example.com. Valid: user@example.com';
      const emails = extract(text);
      expect(emails).toEqual(['user@example.com']);
    });
  });
});
