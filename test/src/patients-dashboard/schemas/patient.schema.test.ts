import { describe, it, expect } from 'vitest';
import { patientFormSchema } from '@/patients-dashboard/schemas/patient.schema';
import type { PatientFormData } from '@/patients-dashboard/schemas/patient.schema';

const validPayload = {
  name: 'Ana',
  description: 'Doctora',
  webpage: '',
  avatar: '',
};

// ============================================================================
// patientFormSchema — four-field validation (edit mode exposes all, create
// defaults webpage/avatar to empty strings completed by the store)
// ============================================================================

describe('patientFormSchema', () => {
  // --- Valid four-field payload ---
  it('accepts a valid payload with name, description, webpage, and avatar', () => {
    const result = patientFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  // --- Valid edit payload with real URLs ---
  it('accepts valid edit payload with real webpage and avatar URLs', () => {
    const editPayload = {
      name: 'Ana',
      description: 'Doctora',
      webpage: 'https://ana.example.com',
      avatar: 'https://ana.example.com/avatar.jpg',
    };
    const result = patientFormSchema.safeParse(editPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(editPayload);
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
      // webpage and avatar are now known fields — they survive
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
      // PatientFormData MUST have webpage and avatar (editable in edit mode)
      expect(formData.webpage).toBe('');
      expect(formData.avatar).toBe('');
      // PatientFormData must NOT have id or createdAt
      expect('id' in formData).toBe(false);
      expect('createdAt' in formData).toBe(false);
    }
  });
});
