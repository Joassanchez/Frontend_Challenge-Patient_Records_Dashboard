import type { Patient } from '@/patients-dashboard/types/patient.types';

const defaults: Patient = {
  id: 'patient-1',
  name: 'Ana García',
  description: 'Paciente de neurología',
  webpage: 'https://example.com/ana',
  avatar: 'https://i.pravatar.cc/150?u=ana',
};

export function createPatient(overrides?: Partial<Patient>): Patient {
  return { ...defaults, ...overrides };
}
