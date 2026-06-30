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
// Render — create mode (2 fields), edit mode (4 fields)
// ============================================================================

describe('PatientForm render', () => {
  it('renders name and description fields with defaultValues (create mode)', () => {
    render(
      <PatientForm
        mode="create"
        defaultValues={validDefaults}
        onSubmit={vi.fn()}
        submitLabel="Crear paciente"
      />,
    );

    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Ana García');
    expect(screen.getByLabelText(/descripción/i)).toHaveValue('Cardiología');
  });

  it('renders empty fields when defaultValues are empty strings (create mode)', () => {
    render(
      <PatientForm
        mode="create"
        defaultValues={emptyDefaults}
        onSubmit={vi.fn()}
        submitLabel="Crear paciente"
      />,
    );

    expect(screen.getByLabelText(/nombre/i)).toHaveValue('');
    expect(screen.getByLabelText(/descripción/i)).toHaveValue('');
  });

  it('does NOT render webpage or avatar inputs in create mode', () => {
    render(
      <PatientForm
        mode="create"
        defaultValues={validDefaults}
        onSubmit={vi.fn()}
        submitLabel="Crear paciente"
      />,
    );

    // Only two form fields exist in create mode — no webpage, no avatar
    expect(screen.queryByLabelText(/página web/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/avatar/i)).not.toBeInTheDocument();
  });

  it('renders webpage and avatar inputs in edit mode with patient values', () => {
    render(
      <PatientForm
        mode="edit"
        defaultValues={validDefaults}
        onSubmit={vi.fn()}
        submitLabel="Guardar cambios"
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
});

// ============================================================================
// Validation errors — Spanish, aria-describedby
// ============================================================================

describe('PatientForm validation errors', () => {
  it('shows "El nombre es obligatorio" when submitting with empty name', async () => {
    const user = userEvent.setup();
    render(
      <PatientForm
        mode="create"
        defaultValues={emptyDefaults}
        onSubmit={vi.fn()}
        submitLabel="Guardar cambios"
      />,
    );

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    const errorMsg = screen.getByText('El nombre es obligatorio');
    expect(errorMsg).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/nombre/i);
    const describedBy = nameInput.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const errorContainer = document.getElementById(describedBy!);
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveAttribute('role', 'alert');
  });

  it('shows "La descripción es obligatoria" when submitting with empty description', async () => {
    const user = userEvent.setup();
    render(
      <PatientForm
        mode="create"
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

  it('inputs have aria-invalid="true" when their field has an error', async () => {
    const user = userEvent.setup();
    render(
      <PatientForm
        mode="create"
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
// Submit — typed, all editable fields
// ============================================================================

describe('PatientForm submit', () => {
  it('calls onSubmit with PatientFormData (all 4 fields) when valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PatientForm
        mode="edit"
        defaultValues={validDefaults}
        onSubmit={onSubmit}
        submitLabel="Crear paciente"
      />,
    );

    await user.click(screen.getByRole('button', { name: /crear paciente/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const callArgs = onSubmit.mock.calls[0];
    expect(callArgs).toHaveLength(2);
    const [formData] = callArgs as [PatientFormData];
    expect(formData).toEqual({
      name: 'Ana García',
      description: 'Cardiología',
      webpage: 'https://ana.example.com',
      avatar: 'https://ana.example.com/avatar.jpg',
    });
    // No id or createdAt leaked
    expect(formData).not.toHaveProperty('id');
    expect(formData).not.toHaveProperty('createdAt');
  });

  it('submits empty webpage and avatar in create mode', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PatientForm
        mode="create"
        defaultValues={emptyDefaults}
        onSubmit={onSubmit}
        submitLabel="Crear paciente"
      />,
    );

    // Fill required fields
    const nameInput = screen.getByLabelText(/nombre/i);
    const descInput = screen.getByLabelText(/descripción/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Nuevo');
    await user.clear(descInput);
    await user.type(descInput, 'Desc');

    await user.click(screen.getByRole('button', { name: /crear paciente/i }));

    const submitted = onSubmit.mock.calls[0]?.[0] as PatientFormData;
    expect(submitted.name).toBe('Nuevo');
    expect(submitted.description).toBe('Desc');
    // webpage and avatar default to '' in create mode
    expect(submitted.webpage).toBe('');
    expect(submitted.avatar).toBe('');
  });

  it('renders submit button with configurable label', () => {
    render(
      <PatientForm
        mode="create"
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
        mode="create"
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
// Submitted data does NOT include id or createdAt
// ============================================================================

describe('PatientForm no store fields in submit', () => {
  it('submitted data does not include id or createdAt', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PatientForm
        mode="edit"
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
// No store dependency — renders from props only
// ============================================================================

describe('PatientForm independence', () => {
  it('renders without needing Zustand store imports or mocks', () => {
    render(
      <PatientForm
        mode="create"
        defaultValues={validDefaults}
        onSubmit={vi.fn()}
        submitLabel="Crear"
      />,
    );

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
  });
});
