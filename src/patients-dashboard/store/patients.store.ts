import { create } from 'zustand';
import { getPatients } from '../api/patients.api';
import { isApiError } from '../../api/types';
import type { Patient } from '../types/patient.types';
import type { PatientFormData } from '../schemas/patient.schema';

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

function generateWebpage(id: string): string {
  return `https://patient.local/${id}`;
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
  addPatient(input: PatientFormData): Patient;
  updatePatient(id: string, data: PatientFormData): void;
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

  addPatient: (input: PatientFormData): Patient => {
    const id = generateId();
    const patient: Patient = {
      name: input.name,
      description: input.description,
      id,
      createdAt: generateCreatedAt(),
      webpage: generateWebpage(id),
      avatar: '',
    };
    set((state) => ({
      patients: [...state.patients, patient],
    }));
    return patient;
  },

  updatePatient: (id: string, data: PatientFormData) => {
    const existing = get().patients.find((p) => p.id === id);
    if (!existing) return; // silent no-op — do not touch state
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === id
          ? {
              ...p,
              name: data.name,
              description: data.description,
              webpage: data.webpage,
              avatar: data.avatar,
            }
          : p,
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
