import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientForm from './PatientForm';
import type { PatientFormData } from '@/patients-dashboard/schemas/patient.schema';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const emptyDefaults: PatientFormData = {
  name: '',
  description: '',
  webpage: '',
  avatar: '',
};

const validDefaults: PatientFormData = {
  name: 'Ana García',
  description: 'Cardiología',
  webpage: 'https://ana.example.com',
  avatar: 'https://ana.example.com/avatar.jpg',
};

// ============================================================================
// REQ-PF-01: Configuración RHF + Zod — renderiza campos con defaultValues
// ============================================================================

describe('REQ-PF-01: Renderizado de campos', () => {
  it('renders name, description, webpage, and avatar fields with defaultValues', () => {
    render(
      <PatientForm
        defaultValues={validDefaults}
        onSubmit={vi.fn()}
        submitLabel="Crear paciente"
      />,
    );

    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Ana García');
    expect(screen.getByLabelText(/descripción/i)).toHaveValue('Cardiología');
    expect(screen.getByLabelText(/página web/i)).toHaveValue(
      'https://ana.example.com',
    );
    expect(screen.getByLabelText(/avatar/i)).toHaveValue(
      'https://ana.example.com/avatar.jpg',
    );
  });

  it('renders empty fields when defaultValues are empty strings', () => {
    render(
      <PatientForm
        defaultValues={emptyDefaults}
        onSubmit={vi.fn()}
        submitLabel="Crear paciente"
      />,
    );

    expect(screen.getByLabelText(/nombre/i)).toHaveValue('');
    expect(screen.getByLabelText(/descripción/i)).toHaveValue('');
    expect(screen.getByLabelText(/página web/i)).toHaveValue('');
    expect(screen.getByLabelText(/avatar/i)).toHaveValue('');
  });
});

// ============================================================================
// REQ-PF-02: Errores de validación con aria-describedby
// ============================================================================

describe('REQ-PF-02: Errores de validación', () => {
  it('shows "El nombre es obligatorio" when submitting with empty name', async () => {
    const user = userEvent.setup();
    render(
      <PatientForm
        defaultValues={emptyDefaults}
        onSubmit={vi.fn()}
        submitLabel="Guardar cambios"
      />,
    );

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    // Error message is visible
    const errorMsg = screen.getByText('El nombre es obligatorio');
    expect(errorMsg).toBeInTheDocument();

    // The input has aria-describedby linking to an error element
    const nameInput = screen.getByLabelText(/nombre/i);
    const describedBy = nameInput.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    // The element with that id exists and has role="alert"
    const errorContainer = document.getElementById(describedBy!);
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveAttribute('role', 'alert');
  });

  it('shows "La descripción es obligatoria" when submitting with empty description', async () => {
    const user = userEvent.setup();
    render(
      <PatientForm
        defaultValues={{ ...validDefaults, description: '' }}
        onSubmit={vi.fn()}
        submitLabel="Guardar"
      />,
    );

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(
      screen.getByText('La descripción es obligatoria'),
    ).toBeInTheDocument();
  });

  it('shows URL validation errors for invalid webpage and avatar', async () => {
    const user = userEvent.setup();
    render(
      <PatientForm
        defaultValues={{
          ...validDefaults,
          webpage: 'not-a-url',
          avatar: 'also-invalid',
        }}
        onSubmit={vi.fn()}
        submitLabel="Guardar"
      />,
    );

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(
      screen.getByText('La página web debe ser una URL válida'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('El avatar debe ser una URL válida'),
    ).toBeInTheDocument();
  });

  it('inputs have aria-invalid="true" when their field has an error', async () => {
    const user = userEvent.setup();
    render(
      <PatientForm
        defaultValues={emptyDefaults}
        onSubmit={vi.fn()}
        submitLabel="Guardar"
      />,
    );

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(screen.getByLabelText(/nombre/i)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});

// ============================================================================
// REQ-PF-03: Submit tipado y label configurable
// ============================================================================

describe('REQ-PF-03: Submit tipado y label configurable', () => {
  it('calls onSubmit with PatientFormData when form is valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PatientForm
        defaultValues={validDefaults}
        onSubmit={onSubmit}
        submitLabel="Crear paciente"
      />,
    );

    await user.click(screen.getByRole('button', { name: /crear paciente/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    // RHF calls handleSubmit callback with (data, event) — data is first arg
    const callArgs = onSubmit.mock.calls[0];
    expect(callArgs).toHaveLength(2);
    
    const [formData] = callArgs as [PatientFormData];
    expect(formData).toEqual(validDefaults);
  });

  it('renders submit button with configurable label', () => {
    render(
      <PatientForm
        defaultValues={validDefaults}
        onSubmit={vi.fn()}
        submitLabel="Guardar cambios"
      />,
    );

    expect(
      screen.getByRole('button', { name: /guardar cambios/i }),
    ).toBeInTheDocument();
  });

  it('renders submit button with different label for create mode', () => {
    render(
      <PatientForm
        defaultValues={validDefaults}
        onSubmit={vi.fn()}
        submitLabel="Crear paciente"
      />,
    );

    expect(
      screen.getByRole('button', { name: /crear paciente/i }),
    ).toBeInTheDocument();
  });
});

// ============================================================================
// REQ-PF-05: No genera id ni createdAt en submit
// ============================================================================

describe('REQ-PF-05: No genera id ni createdAt', () => {
  it('submitted data does not include id or createdAt properties', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PatientForm
        defaultValues={validDefaults}
        onSubmit={onSubmit}
        submitLabel="Guardar"
      />,
    );

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    const submitted = onSubmit.mock.calls[0]?.[0];
    expect(submitted).toBeDefined();
    expect(submitted).not.toHaveProperty('id');
    expect(submitted).not.toHaveProperty('createdAt');
  });
});

// ============================================================================
// REQ-PF-04: Sin acceso a stores — verificación indirecta
// ============================================================================

describe('REQ-PF-04: Sin acceso a stores', () => {
  it('renders without needing Zustand store imports or mocks', () => {
    // PatientForm should work purely from props — no store mocks required
    render(
      <PatientForm
        defaultValues={validDefaults}
        onSubmit={vi.fn()}
        submitLabel="Crear"
      />,
    );

    // If it tries to access a store, this render would throw
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
  });
});
