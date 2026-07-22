let idCounter = 0;

/**
 * Generates a unique local identifier. Prefers `crypto.randomUUID()` when
 * available; falls back to a monotonic counter with a timestamp suffix in
 * environments where the Web Crypto API is absent.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  idCounter += 1;
  return `local-${idCounter}-${Date.now()}`;
}
