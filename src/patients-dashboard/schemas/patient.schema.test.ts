import { describe, it, expect } from 'vitest';
import { patientSchema } from './patient.schema';
import type { PatientFormData } from './patient.schema';

const validPayload = {
  name: 'Juan Pérez',
  description: 'Paciente con historial clínico',
  webpage: 'https://example.com',
  avatar: 'https://example.com/avatar.jpg',
};

describe('patientSchema', () => {
  // 1. Valid payload passes all rules
  it('accepts a valid payload with all fields', () => {
    const result = patientSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  // 2. Empty name fails with Spanish message
  it('rejects empty name with Spanish error message', () => {
    const result = patientSchema.safeParse({ ...validPayload, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.error.issues.find(
        (i) => i.path?.[0] === 'name',
      );
      expect(nameIssue?.message).toBe('El nombre es obligatorio');
    }
  });

  // 3. Empty description fails with Spanish message
  it('rejects empty description with Spanish error message', () => {
    const result = patientSchema.safeParse({
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

  // 4. Whitespace-only name fails (trim before min(1))
  it('rejects whitespace-only name', () => {
    const result = patientSchema.safeParse({ ...validPayload, name: '   ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.error.issues.find(
        (i) => i.path?.[0] === 'name',
      );
      expect(nameIssue?.message).toBe('El nombre es obligatorio');
    }
  });

  // 5. Whitespace-only description fails (trim before min(1))
  it('rejects whitespace-only description', () => {
    const result = patientSchema.safeParse({
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

  // 6. Valid webpage URL passes
  it('accepts a valid webpage URL', () => {
    const result = patientSchema.safeParse({
      ...validPayload,
      webpage: 'https://example.com',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.webpage).toBe('https://example.com');
    }
  });

  // 7. Valid avatar URL passes
  it('accepts a valid avatar URL', () => {
    const result = patientSchema.safeParse({
      ...validPayload,
      avatar: 'https://example.com/avatar.jpg',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.avatar).toBe('https://example.com/avatar.jpg');
    }
  });

  // 8. Invalid webpage URL fails with Spanish message
  it('rejects invalid webpage URL with Spanish error message', () => {
    const result = patientSchema.safeParse({
      ...validPayload,
      webpage: 'not-a-url',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const webIssue = result.error.issues.find(
        (i) => i.path?.[0] === 'webpage',
      );
      expect(webIssue?.message).toBe('La página web debe ser una URL válida');
    }
  });

  // 9. Invalid avatar URL fails with Spanish message
  it('rejects invalid avatar URL with Spanish error message', () => {
    const result = patientSchema.safeParse({
      ...validPayload,
      avatar: 'not-a-url',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const avatarIssue = result.error.issues.find(
        (i) => i.path?.[0] === 'avatar',
      );
      expect(avatarIssue?.message).toBe('El avatar debe ser una URL válida');
    }
  });

  // 10. Missing name field entirely
  it('rejects missing name field', () => {
    const { name: _unused, ...withoutName } = validPayload;
    void _unused;
    const result = patientSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });

  // 11. Missing description field entirely
  it('rejects missing description field', () => {
    const { description: _unused, ...withoutDescription } = validPayload;
    void _unused;
    const result = patientSchema.safeParse(withoutDescription);
    expect(result.success).toBe(false);
  });

  // 12. Missing webpage field entirely
  it('rejects missing webpage field', () => {
    const { webpage: _unused, ...withoutWebpage } = validPayload;
    void _unused;
    const result = patientSchema.safeParse(withoutWebpage);
    expect(result.success).toBe(false);
  });

  // 13. Missing avatar field entirely
  it('rejects missing avatar field', () => {
    const { avatar: _unused, ...withoutAvatar } = validPayload;
    void _unused;
    const result = patientSchema.safeParse(withoutAvatar);
    expect(result.success).toBe(false);
  });

  // 14. Extra unknown fields are stripped (Zod v4 behavior)
  it('strips extra unknown fields from parsed data', () => {
    const withExtra = { ...validPayload, id: 'abc-123' };
    const result = patientSchema.safeParse(withExtra);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });
});

describe('PatientFormData type', () => {
  it('is assignable from parsed schema output', () => {
    const result = patientSchema.safeParse({
      name: 'Ana',
      description: 'Doctora',
      webpage: 'https://example.com',
      avatar: 'https://example.com/avatar.png',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const formData: PatientFormData = result.data;
      expect(formData.name).toBe('Ana');
      expect(formData.description).toBe('Doctora');
      expect(formData.webpage).toBe('https://example.com');
      expect(formData.avatar).toBe('https://example.com/avatar.png');
      // PatientFormData must NOT have id — this is a type-level constraint
      // verified by tsc -b --noEmit, but we also assert it at runtime
      expect('id' in formData).toBe(false);
    }
  });
});
