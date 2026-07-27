import { describe, it, expect } from 'vitest';
import { patientFormSchema, apiPatientSchema } from '@/patients-dashboard/schemas/patient.schema';
import type { PatientFormData } from '@/patients-dashboard/schemas/patient.schema';

const validPayload = {
  name: 'Ana',
  description: 'Doctora',
  website: '',
  avatar: '',
};

// ============================================================================
// patientFormSchema — four-field validation (edit mode exposes all, create
// defaults website/avatar to empty strings completed by the store)
// ============================================================================

describe('patientFormSchema', () => {
  // --- Valid four-field payload ---
  it('accepts a valid payload with name, description, website, and avatar', () => {
    const result = patientFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  // --- Valid edit payload with real URLs ---
  it('accepts valid edit payload with real website and avatar URLs', () => {
    const editPayload = {
      name: 'Ana',
      description: 'Doctora',
      website: 'https://ana.example.com',
      avatar: 'https://ana.example.com/avatar.jpg',
    };
    const result = patientFormSchema.safeParse(editPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(editPayload);
    }
  });

  // --- Rejects invalid website URL (non-http protocol) ---
  it('rejects website with a non-http protocol', () => {
    const result = patientFormSchema.safeParse({
      ...validPayload,
      website: 'ftp://ana.example.com',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path?.[0] === 'website');
      expect(issue?.message).toBe('La página web debe ser una URL válida');
    }
  });

  // --- Rejects invalid avatar URL ---
  it('rejects avatar that is not a valid URL', () => {
    const result = patientFormSchema.safeParse({
      ...validPayload,
      avatar: 'not-a-url',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path?.[0] === 'avatar');
      expect(issue?.message).toBe('El avatar debe ser una URL válida');
    }
  });

  // --- Accepts empty website and avatar (create mode) ---
  it('accepts empty website and avatar strings', () => {
    const result = patientFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.website).toBe('');
      expect(result.data.avatar).toBe('');
    }
  });

  // --- Empty name fails with Spanish message ---
  it('rejects empty name with "El nombre es obligatorio"', () => {
    const result = patientFormSchema.safeParse({
      ...validPayload,
      name: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.error.issues.find(
        (i) => i.path?.[0] === 'name',
      );
      expect(nameIssue?.message).toBe('El nombre es obligatorio');
    }
  });

  // --- Empty description fails with Spanish message ---
  it('rejects empty description with "La descripción es obligatoria"', () => {
    const result = patientFormSchema.safeParse({
      ...validPayload,
      description: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const descIssue = result.error.issues.find(
        (i) => i.path?.[0] === 'description',
      );
      expect(descIssue?.message).toBe('La descripción es obligatoria');
    }
  });

  // --- Whitespace-only name fails (trim before min(1)) ---
  it.each([
    '   ',
    '  \t  ',
  ])('rejects whitespace-only name after trim', (name) => {
    const result = patientFormSchema.safeParse({ name, description: 'Valid' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('El nombre es obligatorio');
  });

  // --- Whitespace-only description fails (trim before min(1)) ---
  it('rejects whitespace-only description after trim', () => {
    const result = patientFormSchema.safeParse({
      ...validPayload,
      description: '   ',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const descIssue = result.error.issues.find(
        (i) => i.path?.[0] === 'description',
      );
      expect(descIssue?.message).toBe('La descripción es obligatoria');
    }
  });

  // --- Missing name field ---
  it('rejects payload missing the name field', () => {
    const { name: _unused, ...withoutName } = validPayload;
    void _unused;
    const result = patientFormSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });

  // --- Missing description field ---
  it('rejects payload missing the description field', () => {
    const { description: _unused, ...withoutDescription } = validPayload;
    void _unused;
    const result = patientFormSchema.safeParse(withoutDescription);
    expect(result.success).toBe(false);
  });

  // --- Extra unknown fields are stripped ---
  it('strips extra unknown fields (id, createdAt) from result', () => {
    const withExtra = {
      ...validPayload,
      id: 'abc-123',
      createdAt: '2025-01-01T00:00:00Z',
    };
    const result = patientFormSchema.safeParse(withExtra);
    expect(result.success).toBe(true);
    if (result.success) {
      // website and avatar are now known fields — they survive
      expect(result.data).toEqual(validPayload);
      expect('id' in result.data).toBe(false);
      expect('createdAt' in result.data).toBe(false);
    }
  });

});

// ============================================================================
// PatientFormData type narrowing
// ============================================================================
describe('PatientFormData type', () => {
  it('is inferred from patientFormSchema and contains all editable fields', () => {
    const result = patientFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      const formData: PatientFormData = result.data;
      expect(formData.name).toBe('Ana');
      expect(formData.description).toBe('Doctora');
      // PatientFormData MUST have website and avatar (editable in edit mode)
      expect(formData.website).toBe('');
      expect(formData.avatar).toBe('');
      // PatientFormData must NOT have id or createdAt
      expect('id' in formData).toBe(false);
      expect('createdAt' in formData).toBe(false);
    }
  });
});

// ============================================================================
// REQ-PSM-02: apiPatientSchema — optional status field
// ============================================================================
describe('apiPatientSchema — optional status', () => {
  const baseApiPatient = {
    id: '1',
    name: 'Ana',
    description: 'Paciente',
    website: 'https://ana.com',
    avatar: '',
  };

  it('accepts a patient without status field (backward compatible)', () => {
    const result = apiPatientSchema.safeParse(baseApiPatient);
    expect(result.success).toBe(true);
  });

  it('accepts status "active"', () => {
    const result = apiPatientSchema.safeParse({
      ...baseApiPatient,
      status: 'active',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('active');
    }
  });

  it('accepts status "inactive"', () => {
    const result = apiPatientSchema.safeParse({
      ...baseApiPatient,
      status: 'inactive',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('inactive');
    }
  });

  it('rejects invalid status values', () => {
    const result = apiPatientSchema.safeParse({
      ...baseApiPatient,
      status: 'deleted',
    });
    expect(result.success).toBe(false);
  });
});
