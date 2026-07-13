import { create } from 'zustand';
import { getItem, setItem, isStringArray } from '@/shared/utils/localStorage';
import { FAVORITES_KEY } from '@/shared/utils/storageKeys';

// ---------------------------------------------------------------------------
// State & Actions types
// ---------------------------------------------------------------------------

export interface FavoritesState {
  favoritePatientIds: string[];
}

export interface FavoritesActions {
  toggleFavorite(id: string): boolean;
  resetStore(): void;
}

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

export const initialState: FavoritesState = {
  favoritePatientIds: [],
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useFavoritesStore = create<FavoritesState & FavoritesActions>()(
  (set, get) => {
    // ---- Internal persist helper ----
    const persist = (ids: string[]) => {
      return setItem(FAVORITES_KEY, ids);
    };

    /** Sanitizes raw IDs from localStorage: removes empty/whitespace-only entries and deduplicates. */
    function sanitizeIds(raw: string[]): string[] {
      if (!Array.isArray(raw)) return [];
      return [...new Set(raw.filter((id) => id.trim().length > 0))];
    }

    // ---- Hydrate initial state from localStorage ----
    const savedIds = sanitizeIds(
      getItem(FAVORITES_KEY, [] as string[], isStringArray),
    );

    // ---- Return store ----
    return {
      favoritePatientIds: savedIds,

      toggleFavorite: (id: string): boolean => {
        const { favoritePatientIds } = get();
        const exists = favoritePatientIds.includes(id);
        const next = exists
          ? favoritePatientIds.filter((fid) => fid !== id)
          : [...favoritePatientIds, id];
        if (!persist(next)) return false;
        set({ favoritePatientIds: next });
        return true;
      },

      resetStore: () => {
        set(initialState);
        // MUST NOT touch localStorage per REQ-FS-05
      },
    };
  },
);

// ---------------------------------------------------------------------------
// Selectors (pure functions accepting store state)
// ---------------------------------------------------------------------------

export function selectFavoriteIds(state: FavoritesState): string[] {
  return state.favoritePatientIds;
}

export function selectIsFavorite(
  id: string,
): (state: FavoritesState) => boolean {
  return (state: FavoritesState) => state.favoritePatientIds.includes(id);
}

export function selectFavoritesCount(state: FavoritesState): number {
  return state.favoritePatientIds.length;
}
