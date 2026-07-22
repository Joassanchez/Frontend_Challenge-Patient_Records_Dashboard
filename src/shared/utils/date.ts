/**
 * Formats an ISO date string into a locale-aware date string.
 * Returns `null` when the input is falsy or cannot be parsed.
 */
export function formatSafeDate(iso: string | undefined, locale = 'es-AR'): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale);
}
