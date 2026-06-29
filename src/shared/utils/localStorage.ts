// ---------------------------------------------------------------------------
// Runtime validator: isStringArray
// ---------------------------------------------------------------------------

export function isStringArray(data: unknown): data is string[] {
  return Array.isArray(data) && data.every((item) => typeof item === 'string');
}

// ---------------------------------------------------------------------------
// getItem – safe localStorage read with fallback and runtime validation
// ---------------------------------------------------------------------------

export function getItem<T>(
  key: string,
  fallback: T,
  validate: (data: unknown) => data is T,
): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!validate(parsed)) {
      return fallback;
    }

    return parsed;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// setItem – safe localStorage write, returns success boolean
// ---------------------------------------------------------------------------

export function setItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}
