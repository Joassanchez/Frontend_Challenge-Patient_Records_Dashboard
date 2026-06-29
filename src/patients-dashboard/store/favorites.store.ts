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
  hydrateFavorites(): void;
  toggleFavorite(id: string): void;
  addFavorite(id: string): void;
  removeFavorite(id: string): void;
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
      setItem(FAVORITES_KEY, ids);
    };

    // ---- Hydrate initial state from localStorage (Zustand: return value is the initial state) ----
    const savedIds = getItem(FAVORITES_KEY, [] as string[], isStringArray);

    // ---- Return store ----
    return {
      favoritePatientIds: savedIds,

      hydrateFavorites: () => {
        const ids = getItem(FAVORITES_KEY, [] as string[], isStringArray);
        set({ favoritePatientIds: ids });
      },

      toggleFavorite: (id: string) => {
        const { favoritePatientIds } = get();
        const exists = favoritePatientIds.includes(id);
        const next = exists
          ? favoritePatientIds.filter((fid) => fid !== id)
          : [...favoritePatientIds, id];
        set({ favoritePatientIds: next });
        persist(next);
      },

      addFavorite: (id: string) => {
        const { favoritePatientIds } = get();
        if (favoritePatientIds.includes(id)) return;
        const next = [...favoritePatientIds, id];
        set({ favoritePatientIds: next });
        persist(next);
      },

      removeFavorite: (id: string) => {
        const { favoritePatientIds } = get();
        if (!favoritePatientIds.includes(id)) return;
        const next = favoritePatientIds.filter((fid) => fid !== id);
        set({ favoritePatientIds: next });
        persist(next);
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
