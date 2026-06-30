import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  usePatientsStore,
  selectPatients,
  selectPatientById,
  selectPatientsLoading,
  selectPatientsError,
} from './patients.store';
import type { Patient } from '../types/patient.types';
import type { PatientFormData } from '../schemas/patient.schema';
import { createPatient } from '@/test/fixtures/patient.fixture';

// Mock the API module before any imports that use it
vi.mock('../api/patients.api');

import { getPatients } from '../api/patients.api';

const patientA = createPatient({
  id: '1',
  name: 'Alice',
  description: 'Patient A description',
  webpage: 'https://alice.example.com',
  avatar: 'https://alice.example.com/avatar.jpg',
});

const patientB = createPatient({
  id: '2',
  name: 'Bob',
  description: 'Patient B description',
  webpage: 'https://bob.example.com',
  avatar: 'https://bob.example.com/avatar.jpg',
});

const patientC = createPatient({
  id: '3',
  name: 'Charlie',
  description: 'Patient C description',
  webpage: 'https://charlie.example.com',
  avatar: 'https://charlie.example.com/avatar.jpg',
});

const formDataA: PatientFormData = {
  name: 'Alice',
  description: 'Patient A description',
  webpage: '',
  avatar: '',
};

const formDataB: PatientFormData = {
  name: 'Bob',
  description: 'Patient B description',
  webpage: '',
  avatar: '',
};

beforeEach(() => {
  vi.clearAllMocks();
  usePatientsStore.getState().resetStore();
});

// ============================================================================
// Initial State
// ============================================================================
describe('Initial State', () => {
  it('initializes with empty patients, isLoading false, error null', () => {
    const state = usePatientsStore.getState();
    expect(state.patients).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
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

  it('selectPatientsError returns error string', () => {
    usePatientsStore.setState({ error: 'Something went wrong' });
    const state = usePatientsStore.getState();
    expect(selectPatientsError(state)).toBe('Something went wrong');
  });
});

// ============================================================================
// addPatient — accepts PatientFormData, auto-generates hidden fields
// ============================================================================
describe('addPatient with PatientFormData', () => {
  it('appends a full Patient from only name and description', () => {
    usePatientsStore.setState({ patients: [patientA] });

    const result = usePatientsStore.getState().addPatient(formDataB);

    const { patients } = usePatientsStore.getState();
    expect(patients).toHaveLength(2);
    expect(patients[0]).toEqual(patientA);
    expect(result).toEqual(patients[1]);
    // input fields preserved
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

  it('generates webpage derived from the new patient id', () => {
    const result = usePatientsStore.getState().addPatient(formDataA);

    expect(typeof result.webpage).toBe('string');
    expect(result.webpage).toContain(result.id);
    // must be a well-formed URL-like string
    expect(result.webpage.startsWith('https://')).toBe(true);
  });

  it('generates webpage deterministically from the id', () => {
    const r1 = usePatientsStore.getState().addPatient(formDataA);
    const r2 = usePatientsStore.getState().addPatient(formDataA);

    // Same input, different ids, different webpages
    expect(r1.id).not.toBe(r2.id);
    expect(r1.webpage).toContain(r1.id);
    expect(r2.webpage).toContain(r2.id);
    expect(r1.webpage).not.toBe(r2.webpage);
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
  it('updates name, description, webpage, and avatar; preserves id and createdAt', () => {
    const existing = createPatient({
      id: '1',
      name: 'Ana',
      description: 'Old desc',
      webpage: 'https://ana.example.com',
      avatar: '',
      createdAt: '2025-01-01T00:00:00Z',
    });
    usePatientsStore.setState({ patients: [existing] });

    usePatientsStore.getState().updatePatient('1', {
      name: 'Ana María',
      description: 'Updated desc',
      webpage: 'https://ana-nueva.example.com',
      avatar: 'https://ana-nueva.example.com/avatar.jpg',
    });

    const updated = usePatientsStore.getState().patients[0];
    expect(updated.name).toBe('Ana María');
    expect(updated.description).toBe('Updated desc');
    expect(updated.webpage).toBe('https://ana-nueva.example.com');
    expect(updated.avatar).toBe('https://ana-nueva.example.com/avatar.jpg');
    // id and createdAt preserved
    expect(updated.id).toBe('1');
    expect(updated.createdAt).toBe('2025-01-01T00:00:00Z');
  });

  it('is a silent no-op for unknown id', () => {
    usePatientsStore.setState({ patients: [patientA], error: null });
    const beforePatients = usePatientsStore.getState().patients;

    usePatientsStore.getState().updatePatient('unknown', {
      name: 'Ghost',
      description: 'Nope',
      webpage: '',
      avatar: '',
    });

    const afterState = usePatientsStore.getState();
    // Patients reference unchanged (no new array)
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
      webpage: 'https://updated.example.com',
      avatar: '',
    });

    const afterPatients = usePatientsStore.getState().patients;
    expect(afterPatients).not.toBe(beforePatients);
    // patientB reference unchanged
    expect(afterPatients[1]).toBe(beforePatients[1]);
  });

  it('updates only matching patient by id', () => {
    usePatientsStore.setState({ patients: [patientA, patientB] });

    usePatientsStore.getState().updatePatient('1', {
      name: 'Alice Updated',
      description: 'New desc',
      webpage: 'https://updated.example.com',
      avatar: '',
    });

    const { patients } = usePatientsStore.getState();
    expect(patients[0].name).toBe('Alice Updated');
    // patientB unchanged
    expect(patients[1].name).toBe('Bob');
  });
});

// ============================================================================
// Clear Error
// ============================================================================
describe('Clear Error', () => {
  it('sets error to null', () => {
    usePatientsStore.setState({ error: 'Server Error' });
    expect(usePatientsStore.getState().error).toBe('Server Error');

    usePatientsStore.getState().clearError();

    expect(usePatientsStore.getState().error).toBeNull();
  });
});

// ============================================================================
// Reset Store
// ============================================================================
describe('Reset Store', () => {
  it('restores state to initialState', () => {
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
// Load Patients — Happy Path
// ============================================================================
describe('Load Patients — Happy Path', () => {
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
    let resolvePromise!: (value: Patient[]) => void;
    const deferred = new Promise<Patient[]>((resolve) => {
      resolvePromise = resolve;
    });
    mockedGetPatients.mockReturnValue(deferred);

    const loadPromise = usePatientsStore.getState().loadPatients();
    expect(usePatientsStore.getState().isLoading).toBe(true);

    resolvePromise([patientA]);
    await loadPromise;
    expect(usePatientsStore.getState().isLoading).toBe(false);
  });
});

// ============================================================================
// Load Patients — ApiError Translation
// ============================================================================
describe('Load Patients — ApiError Translation', () => {
  it('sets error to ApiError message and keeps patients unchanged', async () => {
    const mockedGetPatients = vi.mocked(getPatients);

    const { isApiError } = await import('../../api/types');
    const apiError = {
      status: 500,
      message: 'Server Error',
      code: 'HTTP_ERROR' as const,
    };
    expect(isApiError(apiError)).toBe(true);

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
// Load Patients — Unknown Error Translation
// ============================================================================
describe('Load Patients — Unknown Error', () => {
  it('sets a fallback error message for non-ApiError throws', async () => {
    const mockedGetPatients = vi.mocked(getPatients);
    mockedGetPatients.mockRejectedValue(new Error('network down'));

    await usePatientsStore.getState().loadPatients();

    const state = usePatientsStore.getState();
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


