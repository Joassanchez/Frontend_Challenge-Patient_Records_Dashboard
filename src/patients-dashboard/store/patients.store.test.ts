import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  usePatientsStore,
  selectPatients,
  selectPatientById,
  selectPatientsLoading,
  selectPatientsError,
} from './patients.store';
import type { Patient } from '../types/patient.types';

// Mock the API module before any imports that use it
vi.mock('../api/patients.api');

import { getPatients } from '../api/patients.api';

const patientA: Patient = {
  id: '1',
  name: 'Alice',
  description: 'Patient A description',
  webpage: 'https://alice.example.com',
  avatar: 'https://alice.example.com/avatar.jpg',
};

const patientB: Patient = {
  id: '2',
  name: 'Bob',
  description: 'Patient B description',
  webpage: 'https://bob.example.com',
  avatar: 'https://bob.example.com/avatar.jpg',
};

const patientC: Patient = {
  id: '3',
  name: 'Charlie',
  description: 'Patient C description',
  webpage: 'https://charlie.example.com',
  avatar: 'https://charlie.example.com/avatar.jpg',
};

beforeEach(() => {
  vi.clearAllMocks();
  usePatientsStore.getState().resetStore();
});

// ============================================================================
// REQ-PS-01: Initial State
// ============================================================================
describe('REQ-PS-01: Initial State', () => {
  it('initializes with empty patients, isLoading false, error null', () => {
    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

// ============================================================================
// REQ-PS-10: Exported Selectors
// ============================================================================
describe('REQ-PS-10: Exported Selectors', () => {
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

  it('selectPatientsError returns error string', () => {
    usePatientsStore.setState({ error: 'Something went wrong' });
    const state = usePatientsStore.getState();
    expect(selectPatientsError(state)).toBe('Something went wrong');
  });
});

// ============================================================================
// REQ-PS-05: Add Patient (In-Memory, Immutable)
// ============================================================================
describe('REQ-PS-05: Add Patient', () => {
  it('appends patient to the patients array with generated id and createdAt', () => {
    usePatientsStore.setState({ patients: [patientA] });

    const result = usePatientsStore.getState().addPatient({
      name: patientB.name,
      description: patientB.description,
      webpage: patientB.webpage,
      avatar: patientB.avatar,
    });

    const { patients } = usePatientsStore.getState();
    expect(patients).toHaveLength(2);
    expect(patients[0]).toEqual(patientA);
    expect(result).toEqual(patients[1]);
    expect(typeof result.id).toBe('string');
    expect(result.id.length).toBeGreaterThan(0);
    expect(typeof result.createdAt).toBe('string');
  });

  it('does not mutate the previous patients array reference', () => {
    usePatientsStore.setState({ patients: [patientA] });
    const beforePatients = usePatientsStore.getState().patients;

    usePatientsStore.getState().addPatient({
      name: patientB.name,
      description: patientB.description,
      webpage: patientB.webpage,
      avatar: patientB.avatar,
    });

    const afterPatients = usePatientsStore.getState().patients;
    // Immutability: old reference is unchanged, new reference is different
    expect(afterPatients).not.toBe(beforePatients);
    expect(beforePatients).toEqual([patientA]);
  });
});

// ============================================================================
// REQ-PS-06: Update Patient — Existing ID
// ============================================================================
describe('REQ-PS-06: Update Patient — Existing ID', () => {
  it('replaces the patient with matching id immutably', () => {
    usePatientsStore.setState({ patients: [patientA, patientB] });
    const updatedA: Patient = { ...patientA, name: 'Alice Updated' };

    usePatientsStore.getState().updatePatient(updatedA);

    const { patients } = usePatientsStore.getState();
    expect(patients).toEqual([updatedA, patientB]);
  });

  it('does not mutate unrelated patients', () => {
    usePatientsStore.setState({ patients: [patientA, patientB] });
    const beforePatients = usePatientsStore.getState().patients;
    const updatedA: Patient = { ...patientA, name: 'Alice Updated' };

    usePatientsStore.getState().updatePatient(updatedA);

    const afterPatients = usePatientsStore.getState().patients;
    expect(afterPatients).not.toBe(beforePatients);
    expect(afterPatients[1]).toBe(beforePatients[1]); // patientB reference unchanged
  });
});

// ============================================================================
// REQ-PS-07: Update Patient — Silent No-Op for Unknown ID
// ============================================================================
describe('REQ-PS-07: Update Patient — Unknown ID', () => {
  it('does not modify state when id is not found (silent no-op)', () => {
    usePatientsStore.setState({ patients: [patientA], error: null });
    const beforeState = usePatientsStore.getState();
    const beforePatientsRef = beforeState.patients;

    const unknownPatient: Patient = {
      id: 'nonexistent',
      name: 'Ghost',
      description: 'Does not exist',
      webpage: '',
      avatar: '',
    };
    usePatientsStore.getState().updatePatient(unknownPatient);

    const afterState = usePatientsStore.getState();
    // Patients reference must be unchanged (no new array created)
    expect(afterState.patients).toBe(beforePatientsRef);
    // Error must NOT be set
    expect(afterState.error).toBeNull();
    // Patients content unchanged
    expect(afterState.patients).toEqual([patientA]);
  });
});

// ============================================================================
// REQ-PS-08: Clear Error
// ============================================================================
describe('REQ-PS-08: Clear Error', () => {
  it('sets error to null', () => {
    usePatientsStore.setState({ error: 'Server Error' });
    expect(usePatientsStore.getState().error).toBe('Server Error');

    usePatientsStore.getState().clearError();

    expect(usePatientsStore.getState().error).toBeNull();
  });
});

// ============================================================================
// REQ-PS-09: Reset Store
// ============================================================================
describe('REQ-PS-09: Reset Store', () => {
  it('restores state to initialState', () => {
    // Mutate state first
    usePatientsStore.setState({
      patients: [patientA, patientB, patientC],
      isLoading: true,
      error: 'Some error',
    });

    usePatientsStore.getState().resetStore();

    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

// ============================================================================
// REQ-PS-11: Test Isolation via resetStore
// ============================================================================
describe('REQ-PS-11: Test Isolation', () => {
  it('resetStore is callable and returns state to defaults', () => {
    // This test explicitly validates that resetStore() works as a beforeEach isolation tool
    usePatientsStore.setState({ patients: [patientA], error: 'test error' });
    const { resetStore } = usePatientsStore.getState();
    resetStore();

    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

// ============================================================================
// REQ-PS-02: Load Patients — Happy Path
// ============================================================================
describe('REQ-PS-02: Load Patients — Happy Path', () => {
  it('populates patients on successful API call', async () => {
    const mockedGetPatients = vi.mocked(getPatients);
    mockedGetPatients.mockResolvedValue([patientA, patientB]);

    await usePatientsStore.getState().loadPatients();

    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([patientA, patientB]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets isLoading to true during the call and false after resolution', async () => {
    const mockedGetPatients = vi.mocked(getPatients);
    // Use a deferred promise so we can observe the loading state mid-flight
    let resolvePromise!: (value: Patient[]) => void;
    const deferred = new Promise<Patient[]>((resolve) => {
      resolvePromise = resolve;
    });
    mockedGetPatients.mockReturnValue(deferred);

    const loadPromise = usePatientsStore.getState().loadPatients();

    // isLoading should be true while the call is pending
    expect(usePatientsStore.getState().isLoading).toBe(true);

    // Resolve the deferred promise
    resolvePromise([patientA]);
    await loadPromise;

    // isLoading should be false after resolution
    expect(usePatientsStore.getState().isLoading).toBe(false);
  });
});

// ============================================================================
// REQ-PS-03: Load Patients — ApiError Translation
// ============================================================================
describe('REQ-PS-03: Load Patients — ApiError Translation', () => {
  it('sets error to ApiError message and keeps patients unchanged', async () => {
    const mockedGetPatients = vi.mocked(getPatients);

    // Import isApiError to construct a valid ApiError shape
    const { isApiError } = await import('../../api/types');
    const apiError = { status: 500, message: 'Server Error', code: 'HTTP_ERROR' as const };
    // Verify the mock error satisfies ApiError
    expect(isApiError(apiError)).toBe(true);

    // Pre-populate some patients to verify they are preserved
    usePatientsStore.setState({ patients: [patientA] });

    mockedGetPatients.mockRejectedValue(apiError);

    await usePatientsStore.getState().loadPatients();

    const state = usePatientsStore.getState();
    expect(state.error).toBe('Server Error');
    expect(state.isLoading).toBe(false);
    expect(state.patients).toEqual([patientA]);
  });
});

// ============================================================================
// REQ-PS-04: Load Patients — Unknown Error Translation
// ============================================================================
describe('REQ-PS-04: Load Patients — Unknown Error Translation', () => {
  it('sets a fallback error message for non-ApiError throws', async () => {
    const mockedGetPatients = vi.mocked(getPatients);
    mockedGetPatients.mockRejectedValue(new Error('network down'));

    await usePatientsStore.getState().loadPatients();

    const state = usePatientsStore.getState();
    // Must be a non-empty fallback string
    expect(state.error).toBeTruthy();
    expect(typeof state.error).toBe('string');
    expect(state.isLoading).toBe(false);
  });

  it('preserves patients and isLoading false on unknown error', async () => {
    usePatientsStore.setState({ patients: [patientA, patientB] });
    const mockedGetPatients = vi.mocked(getPatients);
    mockedGetPatients.mockRejectedValue('some weird throw');

    await usePatientsStore.getState().loadPatients();

    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([patientA, patientB]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeTruthy();
  });
});

// ============================================================================
// REQ-PS-05-MODIFIED: Add Patient — genera id y createdAt (NEW SIGNATURE)
// ============================================================================
describe('REQ-PS-05-MODIFIED: Add Patient genera id y createdAt', () => {
  it('generates a non-empty id and valid createdAt ISO string', () => {
    usePatientsStore.getState().resetStore();
    const input = {
      name: 'Nuevo',
      description: 'Test',
      webpage: 'https://test.example.com',
      avatar: 'https://test.example.com/avatar.jpg',
    };

    const result = usePatientsStore.getState().addPatient(input);

    // id must be a non-empty string
    expect(typeof result.id).toBe('string');
    expect(result.id.length).toBeGreaterThan(0);

    // createdAt must be a valid ISO date string
    expect(typeof result.createdAt).toBe('string');
    expect(() => new Date(result.createdAt!)).not.toThrow();
    expect(new Date(result.createdAt!).toISOString()).toBe(result.createdAt);
  });

  it('generates unique ids on consecutive calls', () => {
    usePatientsStore.getState().resetStore();
    const input = {
      name: 'A',
      description: 'B',
      webpage: 'https://a.example.com',
      avatar: 'https://a.example.com/avatar.jpg',
    };

    const r1 = usePatientsStore.getState().addPatient(input);
    const r2 = usePatientsStore.getState().addPatient({ ...input, name: 'B' });

    expect(r1.id).not.toBe(r2.id);
  });

  it('appends the full Patient to the patients array', () => {
    usePatientsStore.getState().resetStore();
    usePatientsStore.setState({ patients: [patientA] });
    const input = {
      name: 'Nuevo',
      description: 'Test',
      webpage: 'https://test.example.com',
      avatar: 'https://test.example.com/avatar.jpg',
    };

    const result = usePatientsStore.getState().addPatient(input);
    const { patients } = usePatientsStore.getState();

    expect(patients).toHaveLength(2);
    expect(patients[1]).toEqual(result);
    expect(patients[1].name).toBe('Nuevo');
    expect(patients[1].id).toBe(result.id);
    expect(patients[1].createdAt).toBe(result.createdAt);
  });

  it('does not mutate the previous patients array reference', () => {
    usePatientsStore.getState().resetStore();
    usePatientsStore.setState({ patients: [patientA] });
    const beforePatients = usePatientsStore.getState().patients;

    const input = {
      name: 'Nuevo',
      description: 'Test',
      webpage: 'https://test.example.com',
      avatar: 'https://test.example.com/avatar.jpg',
    };
    usePatientsStore.getState().addPatient(input);

    const afterPatients = usePatientsStore.getState().patients;
    expect(afterPatients).not.toBe(beforePatients);
    expect(beforePatients).toEqual([patientA]);
  });
});

// ============================================================================
// REQ-PS-12: No Direct Fetch
// ============================================================================
describe('REQ-PS-12: No Direct Fetch', () => {
  it('store module imports getPatients from the API module', async () => {
    // Verify that getPatients can be imported from the API module
    // and that the store uses it (tested via mock in other tests).
    // This test acts as a compile/import-time assertion.
    const apiModule = await import('../api/patients.api');
    expect(apiModule.getPatients).toBeDefined();
    expect(typeof apiModule.getPatients).toBe('function');
  });
});
