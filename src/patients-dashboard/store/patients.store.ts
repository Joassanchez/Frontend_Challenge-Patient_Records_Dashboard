import { create } from 'zustand';
import { getPatientsPage } from '../api/patients.api';
import { handleError } from '@/shared/errors';
import { generateId } from '@/shared/utils/id';
import { hydrateLocalPatients, persistLocalPatients } from '@/shared/utils/localStorage';
import type { Patient } from '../types/patient.types';
import type { PatientFormData } from '../schemas/patient.schema';

function generateCreatedAt(): string {
  return new Date().toISOString();
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
  /** Total acumulado de pacientes únicos cargados hasta el momento. */
  totalLoadedCount: number;
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
  updatePatientStatus(id: string, status: 'active' | 'inactive'): boolean;
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
  totalLoadedCount: 0,
};

// ---------------------------------------------------------------------------
// Helper: persist only local patients
// ---------------------------------------------------------------------------

function persistLocal(patients: Patient[]): void {
  const localOnly = patients.filter((p) => p._origin === 'local');
  persistLocalPatients(localOnly);
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePatientsStore = create<PatientsStore>()((set, get) => {
  // ---- Hydrate local patients from localStorage at store creation ----
  let hydratedLocalPatients: Patient[] = [];
  try {
    hydratedLocalPatients = hydrateLocalPatients();
  } catch (err: unknown) {
    handleError(err, { display: 'silent', context: 'patient-hydration' });
    hydratedLocalPatients = [];
  }

  return {
    // --- Estado ---
    ...initialState,
    patients: hydratedLocalPatients,

    // --- Acciones ---

    loadPatients: async (search?: string) => {
      const normalizedSearch =
        typeof search === 'string' ? search.trim() : '';

      const seq = ++requestSeq;

      set({ isLoading: true, error: null, searchQuery: normalizedSearch });
      try {
        const apiPatients = await getPatientsPage({
          page: 1,
          limit: PATIENTS_PAGE_LIMIT,
          search: normalizedSearch,
        });

        // Descarta si una búsqueda más nueva ya reemplazó este request.
        if (seq !== requestSeq) return;

        // Merge: local patients + API results (dedup by id, local wins)
        const currentLocal = get().patients.filter((p) => p._origin === 'local');
        const localIds = new Set(currentLocal.map((p) => p.id));
        const newApiPatients = apiPatients.filter((p) => !localIds.has(p.id));
        const merged = [...currentLocal, ...newApiPatients];

        set({
          patients: merged,
          isLoading: false,
          isLoadingMore: false,
          error: null,
          currentPage: 1,
          hasMore: hasMorePatientsPage(apiPatients),
          totalLoadedCount: merged.length,
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
            totalLoadedCount: state.totalLoadedCount + onlyNew.length,
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
        website: input.website,
        avatar: input.avatar,
        _origin: 'local',
        status: 'active',
      };
      set((state) => {
        const next = [patient, ...state.patients];
        persistLocal(next);
        return { patients: next, totalLoadedCount: state.totalLoadedCount + 1 };
      });
      return patient;
    },

    updatePatient: (id: string, data: PatientFormData): boolean => {
      const existing = get().patients.find((p) => p.id === id);
      if (!existing) return false;
      set((state) => {
        const next = state.patients.map((p) =>
          p.id === id
            ? {
                ...p,
                name: data.name,
                description: data.description,
                website: data.website,
                avatar: data.avatar,
              }
            : p,
        );
        persistLocal(next);
        return { patients: next };
      });
      return true;
    },

    updatePatientStatus: (id: string, status: 'active' | 'inactive'): boolean => {
      const existing = get().patients.find((p) => p.id === id);
      if (!existing) return false;
      set((state) => {
        const next = state.patients.map((p) =>
          p.id === id ? { ...p, status } : p,
        );
        // Only persist if the updated patient is local
        const updated = next.find((p) => p.id === id);
        if (updated?._origin === 'local') {
          persistLocal(next);
        }
        return { patients: next };
      });
      return true;
    },

    resetStore: () => {
      set(initialState);
    },
  };
});

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

export function selectTotalLoadedCount(state: PatientsState): number {
  return state.totalLoadedCount;
}
