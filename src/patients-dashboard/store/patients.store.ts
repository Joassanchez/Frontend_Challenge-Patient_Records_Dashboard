import { create } from 'zustand';
import { getPatients } from '../api/patients.api';
import { isApiError } from '../../api/types';
import type { Patient } from '../types/patient.types';

// ---------------------------------------------------------------------------
// State & Actions types
// ---------------------------------------------------------------------------

export interface PatientsState {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
}

export interface PatientsActions {
  loadPatients(): Promise<void>;
  addPatient(patient: Patient): void;
  updatePatient(patient: Patient): void;
  clearError(): void;
  resetStore(): void;
}

export type PatientsStore = PatientsState & PatientsActions;

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

export const initialState: PatientsState = {
  patients: [],
  isLoading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePatientsStore = create<PatientsStore>()((set, get) => ({
  // --- State ---
  ...initialState,

  // --- Actions ---

  loadPatients: async () => {
    set({ isLoading: true, error: null });
    try {
      const patients = await getPatients();
      set({ patients, isLoading: false, error: null });
    } catch (error: unknown) {
      const message = isApiError(error)
        ? error.message
        : 'Error al cargar pacientes';
      set({ error: message, isLoading: false });
    }
  },

  addPatient: (patient: Patient) => {
    set((state) => ({
      patients: [...state.patients, patient],
    }));
  },

  updatePatient: (patient: Patient) => {
    const exists = get().patients.some((p) => p.id === patient.id);
    if (!exists) return; // silent no-op — do not touch state
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === patient.id ? patient : p,
      ),
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set(initialState);
  },
}));

// ---------------------------------------------------------------------------
// Selectors (pure functions accepting store state)
// ---------------------------------------------------------------------------

export function selectPatients(state: PatientsState): Patient[] {
  return state.patients;
}

export function selectPatientById(id: string): (state: PatientsState) => Patient | undefined {
  return (state: PatientsState) => state.patients.find((p) => p.id === id);
}

export function selectPatientsLoading(state: PatientsState): boolean {
  return state.isLoading;
}

export function selectPatientsError(state: PatientsState): string | null {
  return state.error;
}
