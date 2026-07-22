import { create } from 'zustand';
import { getItem, setItem, isStringArray } from '@/shared/utils/localStorage';
import { handleError } from '@/shared/errors';

export const FAVORITES_KEY = 'app:favorites:patient-ids' as const;

// ---------------------------------------------------------------------------
// Tipos de estado y acciones
// ---------------------------------------------------------------------------

export interface FavoritesState {
  favoritePatientIds: string[];
}

export interface FavoritesActions {
  toggleFavorite(id: string): { success: boolean; error?: string };
  resetStore(): void;
}

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------

export const initialState: FavoritesState = {
  favoritePatientIds: [],
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useFavoritesStore = create<FavoritesState & FavoritesActions>()(
  (set, get) => {
    // ---- Helper interno de persistencia ----
    const persist = (ids: string[]) => {
      return setItem(FAVORITES_KEY, ids);
    };

    /** Sanea los IDs crudos de localStorage: elimina entradas vacías o con solo espacios y remueve duplicados. */
    function sanitizeIds(raw: string[]): string[] {
      if (!Array.isArray(raw)) return [];
      return [...new Set(raw.filter((id) => id.trim().length > 0))];
    }

    // ---- Hidratar estado inicial desde localStorage ----
    let savedIds: string[] = [];
    try {
      savedIds = sanitizeIds(
        getItem(FAVORITES_KEY, [] as string[], isStringArray),
      );
    } catch (err: unknown) {
      handleError(err, { display: 'silent', context: 'favorite-load' });
      savedIds = [];
    }

    return {
      favoritePatientIds: savedIds,

      toggleFavorite: (id: string) => {
        const { favoritePatientIds } = get();
        const exists = favoritePatientIds.includes(id);
        const next = exists
          ? favoritePatientIds.filter((fid) => fid !== id)
          : [...favoritePatientIds, id];
        if (!persist(next)) {
          handleError(new Error('persist failed'), {
            display: 'silent',
            context: 'favorite-toggle',
          });
          return { success: false, error: 'persist failed' };
        }
        set({ favoritePatientIds: next });
        return { success: true };
      },

      resetStore: () => {
        set(initialState);
        // NO debe tocar localStorage según REQ-FS-05
      },
    };
  },
);

// ---------------------------------------------------------------------------
// Selectores (funciones puras que reciben el estado del store)
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
