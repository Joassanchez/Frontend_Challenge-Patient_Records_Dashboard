import { describe, it, expect } from 'vitest';
import type { Patient } from '@/patients-dashboard/types/patient.types';

// RED: import from file that doesn't exist yet
import { createPatient } from './patient.fixture';

describe('createPatient', () => {
  // ---------------------------------------------------------------------------
  // Scenario: Creates patient with all defaults
  // ---------------------------------------------------------------------------
  describe('default patient', () => {
    it('returns a complete Patient with all default values', () => {
      const patient = createPatient();

      expect(patient.id).toBe('patient-1');
      expect(patient.name).toBe('Ana García');
      expect(patient.description).toBe('Paciente de neurología');
      expect(patient.webpage).toBe('https://example.com/ana');
      expect(patient.avatar).toBe('https://i.pravatar.cc/150?u=ana');
    });

    it('return value satisfies the Patient type structurally', () => {
      const patient: Patient = createPatient();
      expect(patient).toBeDefined();
      // TypeScript compile-time check: patient is assignable to Patient
      const _check: Patient = patient;
      void _check;
    });
  });

  // ---------------------------------------------------------------------------
  // Scenario: Overrides specific fields
  // ---------------------------------------------------------------------------
  describe('partial overrides', () => {
    it('overrides id and name, retaining other defaults', () => {
      const patient = createPatient({ id: 'p-99', name: 'Test' });

      expect(patient.id).toBe('p-99');
      expect(patient.name).toBe('Test');
      // Other fields retain defaults
      expect(patient.description).toBe('Paciente de neurología');
      expect(patient.webpage).toBe('https://example.com/ana');
      expect(patient.avatar).toBe('https://i.pravatar.cc/150?u=ana');
    });

    it('overrides description only', () => {
      const patient = createPatient({ description: 'Cardiología' });

      expect(patient.description).toBe('Cardiología');
      expect(patient.id).toBe('patient-1');
      expect(patient.name).toBe('Ana García');
    });

    it('overrides webpage and avatar only', () => {
      const patient = createPatient({
        webpage: 'https://custom.example',
        avatar: 'https://custom.example/avatar.jpg',
      });

      expect(patient.webpage).toBe('https://custom.example');
      expect(patient.avatar).toBe('https://custom.example/avatar.jpg');
      expect(patient.id).toBe('patient-1');
      expect(patient.name).toBe('Ana García');
    });
  });

  // ---------------------------------------------------------------------------
  // Scenario: Full override replaces all fields
  // ---------------------------------------------------------------------------
  describe('full override', () => {
    it('replaces all fields when every field is overridden', () => {
      const patient = createPatient({
        id: 'full-1',
        name: 'María López',
        description: 'Pediatría',
        webpage: 'https://maria.example.com',
        avatar: 'https://maria.example.com/avatar.jpg',
      });

      expect(patient.id).toBe('full-1');
      expect(patient.name).toBe('María López');
      expect(patient.description).toBe('Pediatría');
      expect(patient.webpage).toBe('https://maria.example.com');
      expect(patient.avatar).toBe('https://maria.example.com/avatar.jpg');
    });
  });

  // ---------------------------------------------------------------------------
  // Triangulation: override with empty values
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('accepts empty string overrides', () => {
      const patient = createPatient({ name: '', description: '' });

      expect(patient.name).toBe('');
      expect(patient.description).toBe('');
      expect(patient.id).toBe('patient-1');
    });

    it('returns independent objects (no shared reference)', () => {
      const p1 = createPatient();
      const p2 = createPatient({ name: 'Different' });

      expect(p1).not.toBe(p2);
      expect(p1.name).not.toBe(p2.name);
    });
  });
});
