/**
 * Email Extractor Module
 * Extracts and validates email addresses from text content
 * Compliant with RFC 5321 basic format
 */

/**
 * RFC 5321 compliant email regex pattern
 * Supports:
 * - Standard formats: name@domain.com
 * - Subdomains: name@mail.company.com
 * - Special characters in local part: first.last@domain.com, first+tag@domain.com
 * - Dots, hyphens, underscores in local part
 */
const EMAIL_PATTERN = /\b[a-zA-Z0-9][a-zA-Z0-9._+-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}\b/g;

/**
 * Validates if a string is a valid email address
 * @param email - The email string to validate
 * @returns true if the email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic structure check
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  // Local part validation
  if (!localPart || localPart.length === 0 || localPart.length > 64) {
    return false;
  }

  // Cannot start or end with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }

  // Cannot have consecutive dots
  if (localPart.includes('..')) {
    return false;
  }

  // Valid characters in local part: alphanumeric, dot, hyphen, underscore, plus
  const localPartPattern = /^[a-zA-Z0-9._+-]+$/;
  if (!localPartPattern.test(localPart)) {
    return false;
  }

  // Domain validation
  if (!domain || domain.length === 0 || domain.length > 255) {
    return false;
  }

  // Domain must have at least one dot
  if (!domain.includes('.')) {
    return false;
  }

  // Cannot start or end with dot or hyphen
  if (domain.startsWith('.') || domain.endsWith('.') || 
      domain.startsWith('-') || domain.endsWith('-')) {
    return false;
  }

  // Cannot have consecutive dots
  if (domain.includes('..')) {
    return false;
  }

  // Valid characters in domain: alphanumeric, dot, hyphen
  const domainPattern = /^[a-zA-Z0-9.-]+$/;
  if (!domainPattern.test(domain)) {
    return false;
  }

  // TLD must be at least 2 characters and only letters
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return false;
  }

  return true;
}

/**
 * Extracts all valid email addresses from text content
 * @param text - The text content to search for emails
 * @returns Array of unique valid email addresses found in the text
 */
export function extract(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Find all potential email matches
  const matches = text.match(EMAIL_PATTERN);
  
  if (!matches) {
    return [];
  }

  // Filter to only valid emails and remove duplicates
  const validEmails = matches.filter(isValidEmail);
  const uniqueEmails = Array.from(new Set(validEmails));

  return uniqueEmails;
}
