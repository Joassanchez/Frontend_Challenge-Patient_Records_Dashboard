import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface UiState {
  isOnline: boolean;
}

export interface UiActions {
  setOnline(isOnline: boolean): void;
  resetStore(): void;
}

export type UiStore = UiState & UiActions;

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------

export const initialState: UiState = {
  isOnline: true,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUiStore = create<UiStore>()((set) => ({
  ...initialState,

  setOnline: (isOnline: boolean) => {
    set({ isOnline });
  },

  resetStore: () => {
    set(initialState);
  },
}));

// ---------------------------------------------------------------------------
// Selectores
// ---------------------------------------------------------------------------

export function selectIsOnline(state: UiState): boolean {
  return state.isOnline;
}
