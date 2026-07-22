import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  usePatientsStore,
  selectPatients,
  selectPatientById,
  selectPatientsLoading,
  selectPatientsLoadingMore,
  selectPatientsError,
  selectPatientsHasMore,
  selectPatientsCurrentPage,
  selectPatientsSearchQuery,
  PATIENTS_PAGE_LIMIT,
  hasMorePatientsPage,
} from '@/patients-dashboard/store/patients.store';
import type { Patient } from '@/patients-dashboard/types/patient.types';
import type { PatientFormData } from '@/patients-dashboard/schemas/patient.schema';
import { createPatient } from '../../../fixtures/patient.fixture';

// Mock the API module before any imports that use it
vi.mock('@/patients-dashboard/api/patients.api');

import { getPatientsPage } from '@/patients-dashboard/api/patients.api';

const patientA = createPatient({
  id: '1',
  name: 'Alice',
  description: 'Patient A description',
  website: 'https://alice.example.com',
  avatar: 'https://alice.example.com/avatar.jpg',
});

const patientB = createPatient({
  id: '2',
  name: 'Bob',
  description: 'Patient B description',
  website: 'https://bob.example.com',
  avatar: 'https://bob.example.com/avatar.jpg',
});

const patientC = createPatient({
  id: '3',
  name: 'Charlie',
  description: 'Patient C description',
  website: 'https://charlie.example.com',
  avatar: 'https://charlie.example.com/avatar.jpg',
});

const formDataA: PatientFormData = {
  name: 'Alice',
  description: 'Patient A description',
  website: '',
  avatar: '',
};

const formDataB: PatientFormData = {
  name: 'Bob',
  description: 'Patient B description',
  website: '',
  avatar: '',
};

const mockedGetPatientsPage = vi.mocked(getPatientsPage);

beforeEach(() => {
  vi.resetAllMocks();
  usePatientsStore.getState().resetStore();
});

// ============================================================================
// Initial State
// ============================================================================
describe('Initial State', () => {
  it('initializes with empty patients, loading flags false, error null, page 0, hasMore true, searchQuery empty', () => {
    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.isLoadingMore).toBe(false);
    expect(state.error).toBeNull();
    expect(state.currentPage).toBe(0);
    expect(state.hasMore).toBe(true);
    expect(state.searchQuery).toBe('');
  });
});

// ============================================================================
// Exported Selectors
// ============================================================================
describe('Exported Selectors', () => {
  it('selectPatients returns the patients array', () => {
    usePatientsStore.setState({ patients: [patientA, patientB] });
    const state = usePatientsStore.getState();
    expect(selectPatients(state)).toEqual([patientA, patientB]);
  });

  it('selectPatientById returns matching patient when found', () => {
    usePatientsStore.setState({ patients: [patientA, patientB] });
    const state = usePatientsStore.getState();
    expect(selectPatientById('1')(state)).toEqual(patientA);
  });

  it('selectPatientById returns undefined when not found', () => {
    usePatientsStore.setState({ patients: [patientA] });
    const state = usePatientsStore.getState();
    expect(selectPatientById('999')(state)).toBeUndefined();
  });

  it('selectPatientsLoading returns isLoading flag', () => {
    usePatientsStore.setState({ isLoading: true });
    const state = usePatientsStore.getState();
    expect(selectPatientsLoading(state)).toBe(true);
  });

  it('selectPatientsLoadingMore returns isLoadingMore flag', () => {
    usePatientsStore.setState({ isLoadingMore: true });
    const state = usePatientsStore.getState();
    expect(selectPatientsLoadingMore(state)).toBe(true);
  });

  it('selectPatientsError returns error string', () => {
    usePatientsStore.setState({ error: 'Something went wrong' });
    const state = usePatientsStore.getState();
    expect(selectPatientsError(state)).toBe('Something went wrong');
  });

  it('selectPatientsHasMore returns hasMore flag', () => {
    usePatientsStore.setState({ hasMore: false });
    const state = usePatientsStore.getState();
    expect(selectPatientsHasMore(state)).toBe(false);
  });

  it('selectPatientsCurrentPage returns currentPage', () => {
    usePatientsStore.setState({ currentPage: 3 });
    const state = usePatientsStore.getState();
    expect(selectPatientsCurrentPage(state)).toBe(3);
  });

  it('selectPatientsSearchQuery returns searchQuery', () => {
    usePatientsStore.setState({ searchQuery: 'ana' });
    const state = usePatientsStore.getState();
    expect(selectPatientsSearchQuery(state)).toBe('ana');
  });
});

// ============================================================================
// addPatient — accepts PatientFormData, auto-generates hidden fields
// ============================================================================
describe('addPatient with PatientFormData', () => {
  it('prepends a full Patient from only name and description', () => {
    usePatientsStore.setState({ patients: [patientA] });

    const result = usePatientsStore.getState().addPatient(formDataB);

    const { patients } = usePatientsStore.getState();
    expect(patients).toHaveLength(2);
    expect(result).toEqual(patients[0]);
    expect(patients[1]).toEqual(patientA);
    expect(result.name).toBe('Bob');
    expect(result.description).toBe('Patient B description');
  });

  it('generates a non-empty id and valid createdAt ISO string', () => {
    const result = usePatientsStore.getState().addPatient(formDataA);

    expect(typeof result.id).toBe('string');
    expect(result.id.length).toBeGreaterThan(0);

    expect(typeof result.createdAt).toBe('string');
    expect(() => new Date(result.createdAt!)).not.toThrow();
    expect(new Date(result.createdAt!).toISOString()).toBe(result.createdAt);
  });

  it('generates unique ids on consecutive calls', () => {
    const r1 = usePatientsStore.getState().addPatient(formDataA);
    const r2 = usePatientsStore.getState().addPatient(formDataB);

    expect(r1.id).not.toBe(r2.id);
  });

  it('generates website derived from the new patient id', () => {
    const result = usePatientsStore.getState().addPatient(formDataA);

    expect(typeof result.website).toBe('string');
    expect(result.website).toContain(result.id);
    expect(result.website.startsWith('https://')).toBe(true);
  });

  it('generates website deterministically from the id', () => {
    const r1 = usePatientsStore.getState().addPatient(formDataA);
    const r2 = usePatientsStore.getState().addPatient(formDataA);

    expect(r1.id).not.toBe(r2.id);
    expect(r1.website).toContain(r1.id);
    expect(r2.website).toContain(r2.id);
    expect(r1.website).not.toBe(r2.website);
  });

  it('generates avatar as empty string', () => {
    const result = usePatientsStore.getState().addPatient(formDataA);

    expect(result.avatar).toBe('');
  });

  it('does not mutate the previous patients array reference', () => {
    usePatientsStore.setState({ patients: [patientA] });
    const beforePatients = usePatientsStore.getState().patients;

    usePatientsStore.getState().addPatient(formDataB);

    const afterPatients = usePatientsStore.getState().patients;
    expect(afterPatients).not.toBe(beforePatients);
    expect(beforePatients).toEqual([patientA]);
  });
});

// ============================================================================
// updatePatient — accepts (id, PatientFormData), updates all editable fields,
// preserves only id and createdAt
// ============================================================================
describe('updatePatient updates all editable fields', () => {
  it('updates name, description, website, and avatar; preserves id and createdAt', () => {
    const existing = createPatient({
      id: '1',
      name: 'Ana',
      description: 'Old desc',
      website: 'https://ana.example.com',
      avatar: '',
      createdAt: '2025-01-01T00:00:00Z',
    });
    usePatientsStore.setState({ patients: [existing] });

    usePatientsStore.getState().updatePatient('1', {
      name: 'Ana María',
      description: 'Updated desc',
      website: 'https://ana-nueva.example.com',
      avatar: 'https://ana-nueva.example.com/avatar.jpg',
    });

    const updated = usePatientsStore.getState().patients[0];
    expect(updated.name).toBe('Ana María');
    expect(updated.description).toBe('Updated desc');
    expect(updated.website).toBe('https://ana-nueva.example.com');
    expect(updated.avatar).toBe('https://ana-nueva.example.com/avatar.jpg');
    expect(updated.id).toBe('1');
    expect(updated.createdAt).toBe('2025-01-01T00:00:00Z');
  });

  it('returns true when patient is found and updated', () => {
    usePatientsStore.setState({ patients: [patientA] });

    const result = usePatientsStore.getState().updatePatient('1', {
      name: 'Alice Updated',
      description: 'New desc',
      website: 'https://updated.example.com',
      avatar: '',
    });

    expect(result).toBe(true);
    expect(usePatientsStore.getState().patients[0].name).toBe('Alice Updated');
  });

  it('returns false and does not mutate state for unknown id', () => {
    usePatientsStore.setState({ patients: [patientA], error: null });
    const beforePatients = usePatientsStore.getState().patients;

    const result = usePatientsStore.getState().updatePatient('unknown', {
      name: 'Ghost',
      description: 'Nope',
      website: '',
      avatar: '',
    });

    expect(result).toBe(false);
    const afterState = usePatientsStore.getState();
    expect(afterState.patients).toBe(beforePatients);
    expect(afterState.error).toBeNull();
    expect(afterState.patients).toEqual([patientA]);
  });

  it('does not mutate the previous patients array on update', () => {
    usePatientsStore.setState({ patients: [patientA, patientB] });
    const beforePatients = usePatientsStore.getState().patients;

    usePatientsStore.getState().updatePatient('1', {
      name: 'Alice Updated',
      description: 'New desc',
      website: 'https://updated.example.com',
      avatar: '',
    });

    const afterPatients = usePatientsStore.getState().patients;
    expect(afterPatients).not.toBe(beforePatients);
    expect(afterPatients[1]).toBe(beforePatients[1]);
  });

  it('updates only matching patient by id', () => {
    usePatientsStore.setState({ patients: [patientA, patientB] });

    usePatientsStore.getState().updatePatient('1', {
      name: 'Alice Updated',
      description: 'New desc',
      website: 'https://updated.example.com',
      avatar: '',
    });

    const { patients } = usePatientsStore.getState();
    expect(patients[0].name).toBe('Alice Updated');
    expect(patients[1].name).toBe('Bob');
  });
});

// ============================================================================
// Reset Store
// ============================================================================
describe('Reset Store', () => {
  it('restores state to initialState (including searchQuery)', () => {
    usePatientsStore.setState({
      patients: [patientA, patientB, patientC],
      isLoading: true,
      isLoadingMore: true,
      error: 'Some error',
      currentPage: 5,
      hasMore: false,
      searchQuery: 'ana',
    });

    usePatientsStore.getState().resetStore();

    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.isLoadingMore).toBe(false);
    expect(state.error).toBeNull();
    expect(state.currentPage).toBe(0);
    expect(state.hasMore).toBe(true);
    expect(state.searchQuery).toBe('');
  });
});

// ============================================================================
// loadPatients — initial page fetch
// ============================================================================
describe('loadPatients — initial page fetch', () => {
  it('allows a new loadPatients call while one is in flight (search supersedes)', async () => {
    // The old isLoading guard is gone — a new search supersedes the prior one
    // via the request sequence token, not by bailing out.
    let resolveFirst!: (v: Patient[]) => void;
    const deferred = new Promise<Patient[]>((r) => {
      resolveFirst = r;
    });
    mockedGetPatientsPage.mockReturnValueOnce(deferred);

    usePatientsStore.setState({ isLoading: true });
    const p = usePatientsStore.getState().loadPatients('new-search');

    // The call did start (API was invoked) even though isLoading was true.
    expect(mockedGetPatientsPage).toHaveBeenCalledTimes(1);

    resolveFirst([patientA]);
    await p;
  });

  it('populates patients and sets currentPage=1 on success', async () => {
    mockedGetPatientsPage.mockResolvedValue([patientA, patientB]);

    await usePatientsStore.getState().loadPatients();

    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([patientA, patientB]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.currentPage).toBe(1);
    expect(state.hasMore).toBe(false);
    expect(mockedGetPatientsPage).toHaveBeenCalledWith({
      page: 1,
      limit: PATIENTS_PAGE_LIMIT,
      search: '',
    });
  });

  it('sets isLoading to true during the call and false after resolution', async () => {
    let resolvePromise!: (value: Patient[]) => void;
    const deferred = new Promise<Patient[]>((resolve) => {
      resolvePromise = resolve;
    });
    mockedGetPatientsPage.mockReturnValue(deferred);

    const loadPromise = usePatientsStore.getState().loadPatients();
    expect(usePatientsStore.getState().isLoading).toBe(true);

    resolvePromise([patientA]);
    await loadPromise;
    expect(usePatientsStore.getState().isLoading).toBe(false);
  });

  it('sets hasMore=false when API returns fewer than limit', async () => {
    mockedGetPatientsPage.mockResolvedValue([patientA]);

    await usePatientsStore.getState().loadPatients();

    expect(usePatientsStore.getState().hasMore).toBe(false);
  });

  it('replaces existing patients on reload (reset to page 1)', async () => {
    usePatientsStore.setState({
      patients: [patientC],
      currentPage: 3,
      hasMore: false,
    });
    mockedGetPatientsPage.mockResolvedValue([patientA, patientB]);

    await usePatientsStore.getState().loadPatients();

    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([patientA, patientB]);
    expect(state.currentPage).toBe(1);
    expect(state.hasMore).toBe(false);
  });
});

// ============================================================================
// loadPatients — ApiError Translation
// ============================================================================
describe('loadPatients — ApiError Translation', () => {
  it('sets error to ApiError message and keeps patients unchanged', async () => {
    const { isApiError } = await import('@/api/types');
    const apiError = {
      status: 500,
      message: 'Server Error',
      code: 'HTTP_ERROR' as const,
    };
    expect(isApiError(apiError)).toBe(true);

    usePatientsStore.setState({ patients: [patientA] });
    mockedGetPatientsPage.mockRejectedValue(apiError);

    await usePatientsStore.getState().loadPatients();

    const state = usePatientsStore.getState();
    expect(state.error).toBe('Server Error');
    expect(state.isLoading).toBe(false);
    expect(state.patients).toEqual([patientA]);
  });
});

// ============================================================================
// loadPatients — Unknown Error Translation
// ============================================================================
describe('loadPatients — Unknown Error', () => {
  it('sets a fallback error message for non-ApiError throws', async () => {
    mockedGetPatientsPage.mockRejectedValue(new Error('network down'));

    await usePatientsStore.getState().loadPatients();

    const state = usePatientsStore.getState();
    expect(state.error).toBeTruthy();
    expect(typeof state.error).toBe('string');
    expect(state.isLoading).toBe(false);
  });

  it('preserves patients and isLoading false on unknown error', async () => {
    usePatientsStore.setState({ patients: [patientA, patientB] });
    mockedGetPatientsPage.mockRejectedValue('some weird throw');

    await usePatientsStore.getState().loadPatients();

    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([patientA, patientB]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeTruthy();
  });
});

// ============================================================================
// loadPatients — search integration
// ============================================================================
describe('loadPatients — search integration', () => {
  it('normalizes and stores the search query (trimmed)', async () => {
    mockedGetPatientsPage.mockResolvedValue([patientA]);

    await usePatientsStore.getState().loadPatients('  ana  ');

    const state = usePatientsStore.getState();
    expect(state.searchQuery).toBe('ana');
    expect(mockedGetPatientsPage).toHaveBeenCalledWith({
      page: 1,
      limit: PATIENTS_PAGE_LIMIT,
      search: 'ana',
    });
  });

  it('treats undefined/empty/whitespace as no search', async () => {
    mockedGetPatientsPage.mockResolvedValue([]);

    await usePatientsStore.getState().loadPatients('   ');

    const state = usePatientsStore.getState();
    expect(state.searchQuery).toBe('');
    expect(mockedGetPatientsPage).toHaveBeenCalledWith({
      page: 1,
      limit: PATIENTS_PAGE_LIMIT,
      search: '',
    });
  });

  it('replaces patients with the first page of search results', async () => {
    usePatientsStore.setState({
      patients: [patientC],
      currentPage: 3,
      hasMore: false,
      searchQuery: 'old',
    });
    mockedGetPatientsPage.mockResolvedValue([patientA, patientB]);

    await usePatientsStore.getState().loadPatients('alice');

    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([patientA, patientB]);
    expect(state.currentPage).toBe(1);
    expect(state.searchQuery).toBe('alice');
  });

  it('discards a stale search response when a newer search was triggered', async () => {
    // Simulate two overlapping searches: the first one resolves AFTER the
    // second one. The store must keep the second search's result.
    let resolveFirst!: (v: Patient[]) => void;
    let resolveSecond!: (v: Patient[]) => void;
    const first = new Promise<Patient[]>((r) => {
      resolveFirst = r;
    });
    const second = new Promise<Patient[]>((r) => {
      resolveSecond = r;
    });

    mockedGetPatientsPage
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second);

    const p1 = usePatientsStore.getState().loadPatients('first');
    const p2 = usePatientsStore.getState().loadPatients('second');

    // Resolve the SECOND search first with its own data.
    resolveSecond([patientB]);
    await p2;

    expect(usePatientsStore.getState().searchQuery).toBe('second');
    expect(usePatientsStore.getState().patients).toEqual([patientB]);

    // Now resolve the FIRST (stale) search — it must NOT overwrite state.
    resolveFirst([patientA, patientA]);
    await p1;

    const state = usePatientsStore.getState();
    expect(state.searchQuery).toBe('second');
    expect(state.patients).toEqual([patientB]);
    expect(state.currentPage).toBe(1);
  });
});

// ============================================================================
// loadNextPatientsPage — pagination append
// ============================================================================
describe('loadNextPatientsPage', () => {
  it('does nothing when hasMore is false', async () => {
    usePatientsStore.setState({ hasMore: false, currentPage: 1 });

    await usePatientsStore.getState().loadNextPatientsPage();

    expect(mockedGetPatientsPage).not.toHaveBeenCalled();
  });

  it('does nothing when isLoading is true', async () => {
    usePatientsStore.setState({ isLoading: true, hasMore: true });

    await usePatientsStore.getState().loadNextPatientsPage();

    expect(mockedGetPatientsPage).not.toHaveBeenCalled();
  });

  it('does nothing when isLoadingMore is true', async () => {
    usePatientsStore.setState({ isLoadingMore: true, hasMore: true, currentPage: 1 });

    await usePatientsStore.getState().loadNextPatientsPage();

    expect(mockedGetPatientsPage).not.toHaveBeenCalled();
  });

  it('appends next page patients and updates currentPage', async () => {
    usePatientsStore.setState({
      patients: [patientA],
      currentPage: 1,
      hasMore: true,
    });
    mockedGetPatientsPage.mockResolvedValue([patientB, patientC]);

    await usePatientsStore.getState().loadNextPatientsPage();

    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([patientA, patientB, patientC]);
    expect(state.currentPage).toBe(2);
    expect(mockedGetPatientsPage).toHaveBeenCalledWith({
      page: 2,
      limit: PATIENTS_PAGE_LIMIT,
      search: '',
    });
  });

  it('sets isLoadingMore true during fetch and false after', async () => {
    usePatientsStore.setState({
      patients: [patientA],
      currentPage: 1,
      hasMore: true,
    });

    let resolvePromise!: (value: Patient[]) => void;
    const deferred = new Promise<Patient[]>((resolve) => {
      resolvePromise = resolve;
    });
    mockedGetPatientsPage.mockReturnValue(deferred);

    const loadPromise = usePatientsStore.getState().loadNextPatientsPage();
    expect(usePatientsStore.getState().isLoadingMore).toBe(true);

    resolvePromise([patientB]);
    await loadPromise;
    expect(usePatientsStore.getState().isLoadingMore).toBe(false);
  });

  it('sets error on failure but preserves existing patients', async () => {
    usePatientsStore.setState({
      patients: [patientA],
      currentPage: 2,
      hasMore: true,
    });
    mockedGetPatientsPage.mockRejectedValue({
      status: 500,
      message: 'Server Error',
      code: 'HTTP_ERROR',
    });

    await usePatientsStore.getState().loadNextPatientsPage();

    const state = usePatientsStore.getState();
    expect(state.error).toBe('Server Error');
    expect(state.isLoadingMore).toBe(false);
    // Patients and currentPage preserved on failure
    expect(state.patients).toEqual([patientA]);
    expect(state.currentPage).toBe(2);
    expect(state.hasMore).toBe(true);
  });

  it('consecutive calls advance pages sequentially', async () => {
    usePatientsStore.setState({ patients: [], currentPage: 0, hasMore: true });

    // Each page must be full (PATIENTS_PAGE_LIMIT) so hasMore stays true
    // between calls. The last page is partial to end pagination.
    const makeFullPage = (prefix: string) =>
      Array.from({ length: PATIENTS_PAGE_LIMIT }, (_, i) =>
        createPatient({ id: `${prefix}-${i}` }),
      );

    mockedGetPatientsPage
      .mockResolvedValueOnce(makeFullPage('p1'))
      .mockResolvedValueOnce(makeFullPage('p2'))
      .mockResolvedValueOnce([patientC]); // partial → hasMore=false

    await usePatientsStore.getState().loadNextPatientsPage();
    expect(usePatientsStore.getState().currentPage).toBe(1);
    expect(usePatientsStore.getState().hasMore).toBe(true);

    await usePatientsStore.getState().loadNextPatientsPage();
    expect(usePatientsStore.getState().currentPage).toBe(2);
    expect(usePatientsStore.getState().hasMore).toBe(true);

    await usePatientsStore.getState().loadNextPatientsPage();
    expect(usePatientsStore.getState().currentPage).toBe(3);
    expect(usePatientsStore.getState().hasMore).toBe(false);

    expect(usePatientsStore.getState().patients).toHaveLength(
      PATIENTS_PAGE_LIMIT * 2 + 1,
    );
  });

  it('forwards the current searchQuery when fetching next pages', async () => {
    usePatientsStore.setState({
      patients: [patientA],
      currentPage: 1,
      hasMore: true,
      searchQuery: 'alice',
    });
    mockedGetPatientsPage.mockResolvedValue([patientB]);

    await usePatientsStore.getState().loadNextPatientsPage();

    expect(mockedGetPatientsPage).toHaveBeenCalledWith({
      page: 2,
      limit: PATIENTS_PAGE_LIMIT,
      search: 'alice',
    });
  });

  it('discards a stale next-page response when a newer search supersedes it', async () => {
    // Scenario:
    // 1. User is viewing page 1 of unfiltered results.
    // 2. IntersectionObserver triggers loadNextPatientsPage (page 2, no search).
    // 3. Before the page-2 response arrives, the user types a search term,
    //    triggering loadPatients('alice') which bumps requestSeq.
    // 4. loadPatients('alice') resolves first with its own page 1.
    // 5. The stale page-2 response resolves AFTER — it must NOT append into
    //    the new search results.
    usePatientsStore.setState({
      patients: [patientA],
      currentPage: 1,
      hasMore: true,
      searchQuery: '',
    });

    // Deferred promise for the stale next-page (page 2, no search).
    let resolveNextPage!: (v: Patient[]) => void;
    const nextPageDeferred = new Promise<Patient[]>(
      (r) => {
        resolveNextPage = r;
      },
    );

    // Deferred promise for the new search (page 1, 'alice').
    let resolveSearch!: (v: Patient[]) => void;
    const searchDeferred = new Promise<Patient[]>(
      (r) => {
        resolveSearch = r;
      },
    );

    // First call = next-page (page 2), second call = new search (page 1).
    mockedGetPatientsPage
      .mockReturnValueOnce(nextPageDeferred)
      .mockReturnValueOnce(searchDeferred);

    // Kick off the next-page fetch (captures requestSeq at this point).
    const nextPagePromise = usePatientsStore.getState().loadNextPatientsPage();

    // Now trigger a new search — this bumps requestSeq.
    const searchPromise = usePatientsStore.getState().loadPatients('alice');

    // Resolve the new search first (simulating it arriving before the stale page).
    resolveSearch([patientB]);
    await searchPromise;

    // The new search results are in state.
    expect(usePatientsStore.getState().searchQuery).toBe('alice');
    expect(usePatientsStore.getState().patients).toEqual([patientB]);
    expect(usePatientsStore.getState().currentPage).toBe(1);

    // Now resolve the stale next-page — it must NOT corrupt the new results.
    resolveNextPage([patientC]);
    await nextPagePromise;

    const state = usePatientsStore.getState();
    // patients must still be only the search result — no stale append.
    expect(state.patients).toEqual([patientB]);
    expect(state.searchQuery).toBe('alice');
    expect(state.currentPage).toBe(1);
    expect(state.hasMore).toBe(false);
    expect(state.isLoadingMore).toBe(false);
  });

  it('clears isLoadingMore when a superseding search fails (stale failure ordering)', async () => {
    // Scenario:
    // 1. loadNextPatientsPage is in flight (isLoadingMore=true).
    // 2. A new loadPatients('search') supersedes it (bumps requestSeq).
    // 3. The new search FAILS.
    // Expected: both isLoading and isLoadingMore must be false — the store
    // must not remain stuck with isLoadingMore=true.
    usePatientsStore.setState({
      patients: [patientA],
      currentPage: 1,
      hasMore: true,
      searchQuery: '',
    });

    // Deferred promise for the in-flight next-page request.
    let resolveNextPage!: (v: Patient[]) => void;
    const nextPageDeferred = new Promise<Patient[]>((r) => {
      resolveNextPage = r;
    });

    // Deferred promise for the new search that will fail.
    let rejectSearch!: (reason: unknown) => void;
    const searchDeferred = new Promise<Patient[]>((_, rej) => {
      rejectSearch = rej;
    });

    mockedGetPatientsPage
      .mockReturnValueOnce(nextPageDeferred)
      .mockReturnValueOnce(searchDeferred);

    // Kick off next-page (sets isLoadingMore=true).
    const nextPagePromise = usePatientsStore.getState().loadNextPatientsPage();
    expect(usePatientsStore.getState().isLoadingMore).toBe(true);

    // New search supersedes the in-flight next-page.
    const searchPromise = usePatientsStore.getState().loadPatients('new-search');

    // The new search fails.
    rejectSearch({
      status: 500,
      message: 'Server Error',
      code: 'HTTP_ERROR',
    });
    await searchPromise;

    const state = usePatientsStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.isLoadingMore).toBe(false);
    expect(state.error).toBe('Server Error');

    // Cleanup: resolve the stale next-page so its promise settles.
    resolveNextPage([]);
    await nextPagePromise;
  });

  it('discards a stale next-page error when a newer search supersedes it', async () => {
    usePatientsStore.setState({
      patients: [patientA],
      currentPage: 1,
      hasMore: true,
      searchQuery: '',
    });

    let rejectNextPage!: (reason: unknown) => void;
    const nextPageDeferred = new Promise<Patient[]>(
      (_, rej) => {
        rejectNextPage = rej;
      },
    );
    let resolveSearch!: (v: Patient[]) => void;
    const searchDeferred = new Promise<Patient[]>(
      (r) => {
        resolveSearch = r;
      },
    );

    mockedGetPatientsPage
      .mockReturnValueOnce(nextPageDeferred)
      .mockReturnValueOnce(searchDeferred);

    const nextPagePromise = usePatientsStore.getState().loadNextPatientsPage();
    const searchPromise = usePatientsStore.getState().loadPatients('alice');

    // Resolve search first.
    resolveSearch([patientB]);
    await searchPromise;

    // Now reject the stale next-page — its error must NOT be set on state.
    rejectNextPage({
      status: 500,
      message: 'Server Error',
      code: 'HTTP_ERROR',
    });
    await nextPagePromise;

    const state = usePatientsStore.getState();
    expect(state.error).toBeNull();
    expect(state.patients).toEqual([patientB]);
    expect(state.isLoadingMore).toBe(false);
  });
});

// ============================================================================
// hasMorePatientsPage — store-owned pagination heuristic
// ============================================================================
describe('hasMorePatientsPage', () => {
  it('returns true when page length equals PATIENTS_PAGE_LIMIT (full page — may have more)', () => {
    const fullPage = Array.from({ length: PATIENTS_PAGE_LIMIT }, (_, i) =>
      createPatient({ id: `p${i}` }),
    );
    expect(hasMorePatientsPage(fullPage)).toBe(true);
  });

  it('returns false when page length is less than PATIENTS_PAGE_LIMIT (partial page — no more)', () => {
    const partialPage = [createPatient({ id: '1' })];
    expect(hasMorePatientsPage(partialPage)).toBe(false);
  });

  it('returns false for empty page (no more)', () => {
    expect(hasMorePatientsPage([])).toBe(false);
  });
});

// ============================================================================
// Store-owned hasMore derivation via loadPatients / loadNextPatientsPage
// ============================================================================
describe('Store-owned hasMore derivation', () => {
  it('loadPatients sets hasMore=true when API returns exactly PATIENTS_PAGE_LIMIT patients', async () => {
    const fullPage = Array.from({ length: PATIENTS_PAGE_LIMIT }, (_, i) =>
      createPatient({ id: `p${i}` }),
    );
    mockedGetPatientsPage.mockResolvedValue(fullPage);

    await usePatientsStore.getState().loadPatients();

    expect(usePatientsStore.getState().hasMore).toBe(true);
  });

  it('loadPatients sets hasMore=false when API returns empty (404/empty)', async () => {
    mockedGetPatientsPage.mockResolvedValue([]);

    await usePatientsStore.getState().loadPatients();

    expect(usePatientsStore.getState().hasMore).toBe(false);
  });

  it('loadNextPatientsPage sets hasMore=true when next page is full', async () => {
    usePatientsStore.setState({
      patients: [patientA],
      currentPage: 1,
      hasMore: true,
    });
    const fullPage = Array.from({ length: PATIENTS_PAGE_LIMIT }, (_, i) =>
      createPatient({ id: `next-${i}` }),
    );
    mockedGetPatientsPage.mockResolvedValue(fullPage);

    await usePatientsStore.getState().loadNextPatientsPage();

    expect(usePatientsStore.getState().hasMore).toBe(true);
  });

  it('loadNextPatientsPage sets hasMore=false when next page is partial', async () => {
    usePatientsStore.setState({
      patients: [patientA],
      currentPage: 1,
      hasMore: true,
    });
    mockedGetPatientsPage.mockResolvedValue([patientB]);

    await usePatientsStore.getState().loadNextPatientsPage();

    expect(usePatientsStore.getState().hasMore).toBe(false);
  });

  it('loadNextPatientsPage sets hasMore=false when next page is empty', async () => {
    usePatientsStore.setState({
      patients: [patientA],
      currentPage: 1,
      hasMore: true,
    });
    mockedGetPatientsPage.mockResolvedValue([]);

    await usePatientsStore.getState().loadNextPatientsPage();

    expect(usePatientsStore.getState().hasMore).toBe(false);
  });
});

// ============================================================================
// loadNextPatientsPage — de-duplication of overlapping pages
// ============================================================================
describe('loadNextPatientsPage — overlapping pages de-duplication', () => {
  it('skips records whose id already exists, preserving existing order', async () => {
    // Page 1: ids 1, 2 — Page 2 (overlapping): ids 2, 3
    usePatientsStore.setState({
      patients: [patientA, patientB],
      currentPage: 1,
      hasMore: true,
    });
    mockedGetPatientsPage.mockResolvedValue([patientB, patientC]);

    await usePatientsStore.getState().loadNextPatientsPage();

    const state = usePatientsStore.getState();
    expect(state.patients.map((p) => p.id)).toEqual(['1', '2', '3']);
    expect(state.patients).toEqual([patientA, patientB, patientC]);
  });

  it('still advances currentPage when overlaps are skipped', async () => {
    usePatientsStore.setState({
      patients: [patientA, patientB],
      currentPage: 1,
      hasMore: true,
    });
    mockedGetPatientsPage.mockResolvedValue([patientB, patientC]);

    await usePatientsStore.getState().loadNextPatientsPage();

    const state = usePatientsStore.getState();
    expect(state.currentPage).toBe(2);
    expect(state.isLoadingMore).toBe(false);
    expect(state.error).toBeNull();
  });

  it('does not mutate patients when the next page is fully duplicated', async () => {
    usePatientsStore.setState({
      patients: [patientA, patientB],
      currentPage: 1,
      hasMore: true,
    });
    const beforePatients = usePatientsStore.getState().patients;
    mockedGetPatientsPage.mockResolvedValue([patientA, patientB]);

    await usePatientsStore.getState().loadNextPatientsPage();

    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([patientA, patientB]);
    // Same reference — no new array was created when nothing was appended.
    expect(state.patients).toBe(beforePatients);
    expect(state.currentPage).toBe(2);
  });

  it('handles a next page where the first half overlaps and the second half is new', async () => {
    const patientD = createPatient({
      id: '4',
      name: 'Diana',
      description: 'Patient D',
      website: 'https://diana.example.com',
      avatar: '',
    });

    usePatientsStore.setState({
      patients: [patientA, patientB, patientC],
      currentPage: 1,
      hasMore: true,
    });
    mockedGetPatientsPage.mockResolvedValue([patientB, patientC, patientD]);

    await usePatientsStore.getState().loadNextPatientsPage();

    const state = usePatientsStore.getState();
    expect(state.patients.map((p) => p.id)).toEqual(['1', '2', '3', '4']);
    expect(state.patients).toEqual([patientA, patientB, patientC, patientD]);
    expect(state.currentPage).toBe(2);
  });

  it('preserves order across multiple overlapping pages', async () => {
    usePatientsStore.setState({ patients: [], currentPage: 0, hasMore: true });

    // Each page must be full (PATIENTS_PAGE_LIMIT) so hasMore stays true
    // between calls, except the last one.
    const makeFullPage = (prefix: string) =>
      Array.from({ length: PATIENTS_PAGE_LIMIT }, (_, i) =>
        createPatient({ id: `${prefix}-${i}` }),
      );

    mockedGetPatientsPage
      .mockResolvedValueOnce(makeFullPage('p1'))
      .mockResolvedValueOnce(makeFullPage('p2'))
      .mockResolvedValueOnce([patientC]); // partial → hasMore=false

    await usePatientsStore.getState().loadNextPatientsPage();
    await usePatientsStore.getState().loadNextPatientsPage();
    await usePatientsStore.getState().loadNextPatientsPage();

    const state = usePatientsStore.getState();
    expect(state.currentPage).toBe(3);
    expect(state.hasMore).toBe(false);
    expect(state.patients).toHaveLength(PATIENTS_PAGE_LIMIT * 2 + 1);
    // Order preserved: p1-0..p1-11, p2-0..p2-11, then patientC
    expect(state.patients[0].id).toBe('p1-0');
    expect(state.patients[PATIENTS_PAGE_LIMIT].id).toBe('p2-0');
    expect(state.patients[PATIENTS_PAGE_LIMIT * 2].id).toBe(patientC.id);
  });
});
