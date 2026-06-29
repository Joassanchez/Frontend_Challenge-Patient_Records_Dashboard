import { create } from 'zustand';

// ---------------------------------------------------------------------------
// State & Actions types
// ---------------------------------------------------------------------------

export type ModalMode = 'create' | 'edit';

export interface ModalState {
  isOpen: boolean;
  mode: ModalMode;
  selectedPatientId: string | null;
}

export interface ModalActions {
  openCreateModal(): void;
  openEditModal(patientId: string): void;
  closeModal(): void;
  resetStore(): void;
}

export type ModalStore = ModalState & ModalActions;

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

export const initialState: ModalState = {
  isOpen: false,
  mode: 'create',
  selectedPatientId: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useModalStore = create<ModalStore>()((set) => ({
  // --- State ---
  ...initialState,

  // --- Actions ---

  openCreateModal: () => {
    set({ isOpen: true, mode: 'create', selectedPatientId: null });
  },

  openEditModal: (patientId: string) => {
    set({ isOpen: true, mode: 'edit', selectedPatientId: patientId });
  },

  closeModal: () => {
    set({ isOpen: false, mode: 'create', selectedPatientId: null });
  },

  resetStore: () => {
    set(initialState);
  },
}));

// ---------------------------------------------------------------------------
// Selectors (pure functions accepting store state)
// ---------------------------------------------------------------------------

export function selectIsOpen(state: ModalState): boolean {
  return state.isOpen;
}

export function selectModalMode(state: ModalState): ModalMode {
  return state.mode;
}

export function selectSelectedPatientId(state: ModalState): string | null {
  return state.selectedPatientId;
}
