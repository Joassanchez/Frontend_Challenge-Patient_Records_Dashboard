import { describe, it, expect, beforeEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — hoisted before store import. Inline fn definitions to avoid TDZ.
// ---------------------------------------------------------------------------

vi.mock('@/shared/utils/localStorage', () => {
  const getItem = vi.fn<
    (key: string, fallback: string[], validate: (data: unknown) => data is string[]) => string[]
  >();
  const setItem = vi.fn<(key: string, value: string[]) => boolean>();
  return {
    getItem,
    setItem,
    isStringArray: (data: unknown): data is string[] =>
      Array.isArray(data) && data.every((item) => typeof item === 'string'),
  };
});

vi.mock('@/shared/utils/storageKeys', () => ({
  FAVORITES_KEY: 'app:favorites:patient-ids',
}));

// Re-import after mock
import { getItem, setItem } from '@/shared/utils/localStorage';
import {
  useFavoritesStore,
  selectFavoriteIds,
  selectIsFavorite,
  selectFavoritesCount,
  type FavoritesState,
} from '@/patients-dashboard/store/favorites.store';

const mockGetItem = vi.mocked(getItem);
const mockSetItem = vi.mocked(setItem);

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockGetItem.mockReturnValue([]);
  mockSetItem.mockReturnValue(true);
  useFavoritesStore.getState().resetStore();
  vi.clearAllMocks();
});

// ============================================================================
// REQ-FS-01: Initial State
// ============================================================================

describe('REQ-FS-01: Initial State', () => {
  it('initializes favoritePatientIds as empty array when localStorage is empty', () => {
    mockGetItem.mockReturnValue([]);
    useFavoritesStore.getState().resetStore();
    const state = useFavoritesStore.getState();
    expect(state.favoritePatientIds).toEqual([]);
  });
});

// ============================================================================
// REQ-FS-02: toggleFavorite
// ============================================================================

describe('REQ-FS-02: toggleFavorite', () => {
  it('adds an ID and returns true when not present', () => {
    const result = useFavoritesStore.getState().toggleFavorite('p1');
    const state = useFavoritesStore.getState();
    expect(result).toBe(true);
    expect(state.favoritePatientIds).toEqual(['p1']);
  });

  it('removes an ID and returns true when present', () => {
    useFavoritesStore.setState({ favoritePatientIds: ['p1', 'p2'] });
    const result = useFavoritesStore.getState().toggleFavorite('p1');
    const state = useFavoritesStore.getState();
    expect(result).toBe(true);
    expect(state.favoritePatientIds).toEqual(['p2']);
  });

  it('does not create duplicate IDs', () => {
    useFavoritesStore.setState({ favoritePatientIds: ['p1'] });
    const r1 = useFavoritesStore.getState().toggleFavorite('p1');
    expect(r1).toBe(true);
    const r2 = useFavoritesStore.getState().toggleFavorite('p1');
    expect(r2).toBe(true);
    const state = useFavoritesStore.getState();
    expect(state.favoritePatientIds).toEqual(['p1']);
  });

  it('persists state to localStorage after toggle (add)', () => {
    mockSetItem.mockReturnValue(true);
    useFavoritesStore.getState().toggleFavorite('p99');
    expect(mockSetItem).toHaveBeenCalledWith(
      'app:favorites:patient-ids',
      ['p99'],
    );
  });

  it('persists state to localStorage after toggle (remove)', () => {
    useFavoritesStore.setState({ favoritePatientIds: ['p1', 'p2'] });
    vi.clearAllMocks();
    mockSetItem.mockReturnValue(true);
    useFavoritesStore.getState().toggleFavorite('p1');
    expect(mockSetItem).toHaveBeenCalledWith(
      'app:favorites:patient-ids',
      ['p2'],
    );
  });

  it('returns false and does NOT mutate state when persist fails', () => {
    useFavoritesStore.setState({ favoritePatientIds: ['p1', 'p2'] });
    mockSetItem.mockReturnValue(false);
    const result = useFavoritesStore.getState().toggleFavorite('p1');
    expect(result).toBe(false);
    const state = useFavoritesStore.getState();
    expect(state.favoritePatientIds).toEqual(['p1', 'p2']);
  });
});

// ============================================================================
// REQ-FS-03: Selectors
// ============================================================================

describe('REQ-FS-03: Selectors', () => {
  const state: FavoritesState = { favoritePatientIds: ['p1', 'p2', 'p3'] };

  it('selectFavoriteIds returns all favorite IDs', () => {
    expect(selectFavoriteIds(state)).toEqual(['p1', 'p2', 'p3']);
  });

  it('selectIsFavorite returns true when ID is present', () => {
    expect(selectIsFavorite('p1')(state)).toBe(true);
    expect(selectIsFavorite('p2')(state)).toBe(true);
  });

  it('selectIsFavorite returns false when ID is absent', () => {
    expect(selectIsFavorite('p999')(state)).toBe(false);
  });

  it('selectFavoritesCount returns the correct count', () => {
    expect(selectFavoritesCount(state)).toBe(3);
  });
});

// ============================================================================
// REQ-FS-05: resetStore
// ============================================================================

describe('REQ-FS-05: resetStore', () => {
  it('clears favoritePatientIds to empty array', () => {
    useFavoritesStore.setState({ favoritePatientIds: ['p1', 'p2', 'p3'] });
    useFavoritesStore.getState().resetStore();
    const state = useFavoritesStore.getState();
    expect(state.favoritePatientIds).toEqual([]);
  });

  it('does NOT persist to localStorage on reset', () => {
    useFavoritesStore.setState({ favoritePatientIds: ['p1', 'p2'] });
    vi.clearAllMocks();
    useFavoritesStore.getState().resetStore();
    expect(mockSetItem).not.toHaveBeenCalled();
  });
});
