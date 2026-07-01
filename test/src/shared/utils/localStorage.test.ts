import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getItem, setItem, isStringArray } from '@/shared/utils/localStorage';
import { FAVORITES_KEY } from '@/shared/utils/storageKeys';

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

// ============================================================================
// REQ-FP-03: isStringArray validator
// ============================================================================

describe('REQ-FP-03: isStringArray validator', () => {
  it('returns true for a valid array of strings', () => {
    expect(isStringArray(['a', 'b', 'c'])).toBe(true);
  });

  it('returns true for an empty array', () => {
    expect(isStringArray([])).toBe(true);
  });

  it('returns false for an array with non-string elements', () => {
    expect(isStringArray(['a', 1 as unknown, 'c'])).toBe(false);
  });

  it.each([
    ['a string', 'some string'],
    ['an object', { key: 'value' }],
    ['null', null],
    ['undefined', undefined],
  ])('returns false for %s', (_, value) => {
    expect(isStringArray(value)).toBe(false);
  });
});

// ============================================================================
// REQ-FP-05: FAVORITES_KEY constant
// ============================================================================

describe('REQ-FP-05: FAVORITES_KEY constant', () => {
  it('is defined with the correct value', () => {
    expect(FAVORITES_KEY).toBe('app:favorites:patient-ids');
  });
});

// ============================================================================
// REQ-FP-01: getItem – safe reads
// ============================================================================

describe('REQ-FP-01: getItem safe reads', () => {
  it('returns parsed value on successful read with valid shape', () => {
    localStorage.setItem('test-key', JSON.stringify(['p1', 'p2']));
    const result = getItem('test-key', [], isStringArray);
    expect(result).toEqual(['p1', 'p2']);
  });

  it('returns fallback when key is missing', () => {
    const result = getItem('nonexistent-key', ['default-id'], isStringArray);
    expect(result).toEqual(['default-id']);
  });

  it('returns fallback on corrupted JSON', () => {
    localStorage.setItem('test-key', 'not-valid-json{{');
    const result = getItem('test-key', [], isStringArray);
    expect(result).toEqual([]);
  });

  it('returns fallback when data shape is invalid (object instead of array)', () => {
    localStorage.setItem('test-key', JSON.stringify({ a: 1 }));
    const result = getItem('test-key', [], isStringArray);
    expect(result).toEqual([]);
  });

  it('returns fallback when data is an array with non-string elements', () => {
    localStorage.setItem('test-key', JSON.stringify(['a', 1, 'c']));
    const result = getItem('test-key', [], isStringArray);
    expect(result).toEqual([]);
  });

  it('returns original parsed value when empty array is stored', () => {
    localStorage.setItem('test-key', JSON.stringify([]));
    const result = getItem('test-key', ['fallback'], isStringArray);
    expect(result).toEqual([]);
  });
});

// ============================================================================
// REQ-FP-02: setItem – safe writes
// ============================================================================

describe('REQ-FP-02: setItem safe writes', () => {
  it('writes successfully and returns true', () => {
    const result = setItem('test-key', ['p1', 'p2']);
    expect(result).toBe(true);
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify(['p1', 'p2']));
  });

  it('returns false when localStorage.setItem throws (quota exceeded)', () => {
    // Spy on setItem to simulate quota error
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });

    const result = setItem('test-key', ['p1']);
    expect(result).toBe(false);

    // Restore
    Storage.prototype.setItem = originalSetItem;
  });


});

// ============================================================================
// REQ-FP-04: Guard de entorno (typeof window absent)
// ============================================================================

describe('REQ-FP-04: environment guard', () => {
  it('getItem returns fallback when window is undefined', () => {
    // Simulate SSR: temporarily override typeof check
    const windowBackup = (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).window;

    const result = getItem('any-key', ['ssr-fallback'], isStringArray);

    // Restore
    if (windowBackup !== undefined) {
      (globalThis as Record<string, unknown>).window = windowBackup;
    }

    expect(result).toEqual(['ssr-fallback']);
  });

  it('setItem returns false when window is undefined', () => {
    const windowBackup = (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).window;

    const result = setItem('any-key', ['p1']);

    // Restore
    if (windowBackup !== undefined) {
      (globalThis as Record<string, unknown>).window = windowBackup;
    }

    expect(result).toBe(false);
  });
});
