import { create } from 'zustand';
import { getPatientsPage } from '../api/patients.api';
import { handleError } from '@/shared/errors';
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
// Constants
// ---------------------------------------------------------------------------

export const PATIENTS_PAGE_LIMIT = 12;

// ---------------------------------------------------------------------------
// Heurística de paginación
// ---------------------------------------------------------------------------
// MockAPI no expone total ni metadatos de paginación. Una página llena
// (length === limit) sugiere que puede haber más; una página parcial o vacía
// indica que llegamos al final. Si el total es múltiplo exacto del límite,
// la última página llena dispara un request extra vacío antes de cortar.
export function hasMorePatientsPage(pagePatients: Patient[]): boolean {
  return pagePatients.length === PATIENTS_PAGE_LIMIT;
}

// ---------------------------------------------------------------------------
// Guarda contra respuestas viejas
// ---------------------------------------------------------------------------
// Contador creciente que se incrementa en cada loadPatients. Las respuestas
// de requests anteriores se descartan si el contador ya avanzó.
let requestSeq = 0;

// ---------------------------------------------------------------------------
// Tipos de estado y acciones
// ---------------------------------------------------------------------------

export interface PatientsState {
  patients: Patient[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  /** Búsqueda activa aplicada a la lista actual. */
  searchQuery: string;
}

export interface PatientsActions {
  /**
   * Fetches page 1 for the given search term (or no search) and replaces the
   * list. Resets pagination state and updates `searchQuery`.
   */
  loadPatients(search?: string): Promise<void>;
  /**
   * Fetches the next page using the current `searchQuery` and appends results.
   * Guards against duplicates.
   */
  loadNextPatientsPage(): Promise<void>;
  addPatient(input: PatientFormData): Patient;
  updatePatient(id: string, data: PatientFormData): boolean;
  resetStore(): void;
}

export type PatientsStore = PatientsState & PatientsActions;

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------

export const initialState: PatientsState = {
  patients: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  currentPage: 0,
  hasMore: true,
  searchQuery: '',
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePatientsStore = create<PatientsStore>()((set, get) => ({
  // --- Estado ---
  ...initialState,

  // --- Acciones ---

  loadPatients: async (search?: string) => {
    const normalizedSearch =
      typeof search === 'string' ? search.trim() : '';

    const seq = ++requestSeq;

    set({ isLoading: true, error: null, searchQuery: normalizedSearch });
    try {
      const patients = await getPatientsPage({
        page: 1,
        limit: PATIENTS_PAGE_LIMIT,
        search: normalizedSearch,
      });

      // Descarta si una búsqueda más nueva ya reemplazó este request.
      if (seq !== requestSeq) return;

      set({
        patients,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        currentPage: 1,
        hasMore: hasMorePatientsPage(patients),
      });
    } catch (error: unknown) {
      if (seq !== requestSeq) return;
      const message = handleError(error, {
        display: 'inline',
        context: 'load-patients',
      });
      // Limpia también isLoadingMore: si esta búsqueda reemplazó un
      // loadNextPatientsPage en vuelo, su flag no debe quedar trabado.
      set({ error: message ?? null, isLoading: false, isLoadingMore: false });
    }
  },

  loadNextPatientsPage: async () => {
    const { isLoading, isLoadingMore, hasMore, currentPage, searchQuery } =
      get();
    // No hacer nada si ya está cargando o no hay más páginas.
    if (isLoading || isLoadingMore || !hasMore) return;

    // Guarda el contador actual para descartar la respuesta si una
    // búsqueda nueva reemplaza este request mientras está en vuelo.
    const seq = requestSeq;

    const nextPage = currentPage + 1;
    set({ isLoadingMore: true, error: null });
    try {
      const newPatients = await getPatientsPage({
        page: nextPage,
        limit: PATIENTS_PAGE_LIMIT,
        search: searchQuery,
      });

      // Descarta si una búsqueda más nueva ya reemplazó la lista.
      if (seq !== requestSeq) return;

      set((state) => {
        // Deduplica por id: mantiene el orden existente y solo agrega
        // registros nuevos en el orden que vienen de la API.
        const seenIds = new Set(state.patients.map((p) => p.id));
        const onlyNew = newPatients.filter((p) => !seenIds.has(p.id));
        return {
          patients: onlyNew.length > 0
            ? [...state.patients, ...onlyNew]
            : state.patients,
          isLoadingMore: false,
          currentPage: nextPage,
          hasMore: hasMorePatientsPage(newPatients),
          error: null,
        };
      });
    } catch (error: unknown) {
      // Descarta errores de requests viejos también.
      if (seq !== requestSeq) return;
      const message = handleError(error, {
        display: 'inline',
        context: 'load-more-patients',
      });
      set({ error: message ?? null, isLoadingMore: false });
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
// Selectors (funciones puras que reciben el estado del store)
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

export function selectPatientsLoadingMore(state: PatientsState): boolean {
  return state.isLoadingMore;
}

export function selectPatientsError(state: PatientsState): string | null {
  return state.error;
}

export function selectPatientsHasMore(state: PatientsState): boolean {
  return state.hasMore;
}

export function selectPatientsCurrentPage(state: PatientsState): number {
  return state.currentPage;
}

export function selectPatientsSearchQuery(state: PatientsState): string {
  return state.searchQuery;
}
