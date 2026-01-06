/**
 * Utility functions for comparativa token generation and validation
 */

/**
 * Generate a secure random token for comparativa sharing
 * Uses crypto.randomUUID() if available, otherwise falls back to a custom implementation
 */
export function generateComparativaToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Remove hyphens and make URL-safe
    return crypto.randomUUID().replace(/-/g, '');
  }
  
  // Fallback: generate a random string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Validate token format (basic validation)
 */
export function isValidTokenFormat(token: string): boolean {
  // Token should be alphanumeric and between 20-40 characters
  return /^[A-Za-z0-9]{20,40}$/.test(token);
}

