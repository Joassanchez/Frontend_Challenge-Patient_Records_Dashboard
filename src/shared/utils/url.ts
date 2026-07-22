/**
 * Returns `true` when `url` is a valid absolute HTTP or HTTPS URL.
 */
export function isValidWebUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extracts a human-readable hostname from a URL, stripping the `www.` prefix.
 * Falls back to the raw input when the URL cannot be parsed.
 */
export function formatWebsiteDisplay(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.replace(/^www\./, '');
  } catch {
    return url;
  }
}
