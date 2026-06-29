import { create } from 'zustand';
import { getPatients } from '../api/patients.api';
import { isApiError } from '../../api/types';
import type { Patient } from '../types/patient.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idCounter = 0;

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  idCounter += 1;
  return `local-${idCounter}-${Date.now()}`;
}

function generateCreatedAt(): string {
  return new Date().toISOString();
}

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
  addPatient(input: Omit<Patient, 'id' | 'createdAt'>): Patient;
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

  addPatient: (input: Omit<Patient, 'id' | 'createdAt'>): Patient => {
    const patient: Patient = {
      ...input,
      id: generateId(),
      createdAt: generateCreatedAt(),
    };
    set((state) => ({
      patients: [...state.patients, patient],
    }));
    return patient;
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

export function selectPatientById(id: string | null): (state: PatientsState) => Patient | undefined {
  return (state: PatientsState) => {
    if (id === null) return undefined;
    return state.patients.find((p) => p.id === id);
  };
}

export function selectPatientsLoading(state: PatientsState): boolean {
  return state.isLoading;
}

export function selectPatientsError(state: PatientsState): string | null {
  return state.error;
}
