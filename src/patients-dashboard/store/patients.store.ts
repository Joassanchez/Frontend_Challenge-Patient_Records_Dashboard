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

function generateWebsite(id: string): string {
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
  updatePatient(id: string, data: PatientFormData): boolean;
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
    if (get().isLoading) return;
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
      website: generateWebsite(id),
      avatar: '',
    };
    set((state) => ({
      patients: [patient, ...state.patients],
    }));
    return patient;
  },

  updatePatient: (id: string, data: PatientFormData): boolean => {
    const existing = get().patients.find((p) => p.id === id);
    if (!existing) return false;
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === id
          ? {
              ...p,
              name: data.name,
              description: data.description,
              website: data.website,
              avatar: data.avatar,
            }
          : p,
      ),
    }));
    return true;
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
