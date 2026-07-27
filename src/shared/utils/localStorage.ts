// ---------------------------------------------------------------------------
// Validador en tiempo de ejecución: isStringArray
// ---------------------------------------------------------------------------

export function isStringArray(data: unknown): data is string[] {
  return Array.isArray(data) && data.every((item) => typeof item === 'string');
}

// ---------------------------------------------------------------------------
// getItem — lectura segura de localStorage con valor por defecto y validación
// ---------------------------------------------------------------------------

export function getItem<T>(
  key: string,
  fallback: T,
  validate: (data: unknown) => data is T,
): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!validate(parsed)) {
      return fallback;
    }

    return parsed;
  } catch (err) {
    console.warn(`[localStorage.getItem] Error reading key "${key}":`, err);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// setItem — escritura segura en localStorage, devuelve booleano de éxito
// ---------------------------------------------------------------------------

export function setItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn(`[localStorage.setItem] Error writing key "${key}":`, err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Local patients persistence — versioned envelope
// ---------------------------------------------------------------------------

import type { Patient } from '@/patients-dashboard/types/patient.types';

export const LOCAL_PATIENTS_KEY = 'app:patients:local:v1' as const;
const LOCAL_PATIENTS_VERSION = 1;

interface LocalPatientsPayload {
  version: number;
  patients: Patient[];
}

function isLocalPatientsPayload(data: unknown): data is LocalPatientsPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    'version' in data &&
    'patients' in data &&
    typeof (data as LocalPatientsPayload).version === 'number' &&
    Array.isArray((data as LocalPatientsPayload).patients)
  );
}

/**
 * Reads local patients from localStorage. Returns [] on:
 * - Key absent
 * - Corrupted JSON
 * - Version mismatch (clears old key with a warning)
 * - Invalid shape
 */
export function hydrateLocalPatients(): Patient[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_PATIENTS_KEY);
    if (raw === null) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!isLocalPatientsPayload(parsed)) {
      console.warn(
        '[hydrateLocalPatients] Invalid payload shape — clearing key',
      );
      window.localStorage.removeItem(LOCAL_PATIENTS_KEY);
      return [];
    }

    if (parsed.version !== LOCAL_PATIENTS_VERSION) {
      console.warn(
        `[hydrateLocalPatients] Schema version mismatch (found v${parsed.version}, expected v${LOCAL_PATIENTS_VERSION}) — clearing old data`,
      );
      window.localStorage.removeItem(LOCAL_PATIENTS_KEY);
      return [];
    }

    return parsed.patients;
  } catch (err) {
    console.warn('[hydrateLocalPatients] Error reading localStorage:', err);
    return [];
  }
}

/**
 * Writes local patients to localStorage with a versioned envelope.
 * No-throw on quota exceeded or unavailable localStorage.
 */
export function persistLocalPatients(patients: Patient[]): void {
  setItem(LOCAL_PATIENTS_KEY, {
    version: LOCAL_PATIENTS_VERSION,
    patients,
  });
}
