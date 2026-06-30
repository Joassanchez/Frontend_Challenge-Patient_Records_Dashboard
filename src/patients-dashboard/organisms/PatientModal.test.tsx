import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientModal from './PatientModal';
import { createPatient } from '@/test/fixtures/patient.fixture';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const existingPatient = createPatient({
  id: 'p1',
  name: 'Carlos López',
  description: 'Neurología',
  webpage: 'https://carlos.example.com',
  avatar: 'https://carlos.example.com/avatar.jpg',
  createdAt: '2024-01-15T10:00:00Z',
});

// ---------------------------------------------------------------------------
// Modal store mock
// ---------------------------------------------------------------------------

const mockCloseModal = vi.fn();

function defaultModalState() {
  return {
    isOpen: false,
    mode: 'create' as const,
    selectedPatientId: null as string | null,
    closeModal: mockCloseModal,
  };
}

let modalStoreState = defaultModalState();

vi.mock('@/patients-dashboard/store/modal.store', () => ({
  useModalStore: vi.fn(
    (selector?: (s: ReturnType<typeof defaultModalState>) => unknown) => {
      if (typeof selector === 'function') return selector(modalStoreState);
      return modalStoreState;
    },
  ),
  selectIsOpen: (s: ReturnType<typeof defaultModalState>) => s.isOpen,
  selectModalMode: (s: ReturnType<typeof defaultModalState>) => s.mode,
  selectSelectedPatientId: (s: ReturnType<typeof defaultModalState>) =>
    s.selectedPatientId,
}));

// ---------------------------------------------------------------------------
// Toast store mock
// ---------------------------------------------------------------------------

const { toastSpy } = vi.hoisted(() => {
  const showSuccess = vi.fn();
  const toasts: unknown[] = [];
  return { toastSpy: { showSuccess, toasts } };
});

vi.mock('@/patients-dashboard/store/toast.store', () => ({
  useToastStore: vi.fn(
    (selector?: (s: { toasts: unknown[]; showSuccess: typeof toastSpy.showSuccess }) => unknown) => {
      const state = { toasts: toastSpy.toasts, showSuccess: toastSpy.showSuccess };
      if (typeof selector === 'function') return selector(state);
      return state;
    },
  ),
}));

// ---------------------------------------------------------------------------
// Patients store mock
// ---------------------------------------------------------------------------

const mockAddPatient = vi.fn();
const mockUpdatePatient = vi.fn();

function defaultPatientsState() {
  return {
    patients: [existingPatient] as Patient[],
    addPatient: mockAddPatient,
    updatePatient: mockUpdatePatient,
  };
}

let patientsStoreState = defaultPatientsState();

vi.mock('@/patients-dashboard/store/patients.store', () => ({
  usePatientsStore: vi.fn(
    (selector?: (s: ReturnType<typeof defaultPatientsState>) => unknown) => {
      if (typeof selector === 'function') return selector(patientsStoreState);
      return patientsStoreState;
    },
  ),
  selectPatientById:
    (id: string | null) =>
    (state: ReturnType<typeof defaultPatientsState>) =>
      id ? state.patients.find((p) => p.id === id) : undefined,
}));

// ---------------------------------------------------------------------------
// Test isolation
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  modalStoreState = defaultModalState();
  patientsStoreState = defaultPatientsState();
  toastSpy.toasts = [];
  toastSpy.showSuccess = vi.fn();
});

// ============================================================================
// Create mode — two-field form, empty defaults
// ============================================================================

describe('Create mode', () => {
  it('renders Modal with create title and PatientForm with empty defaults', () => {
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'create',
      selectedPatientId: null,
    };

    render(<PatientModal />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Nuevo paciente')).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('');
    expect(screen.getByLabelText(/descripción/i)).toHaveValue('');
  });

  it('does NOT render webpage or avatar inputs in create mode', () => {
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'create',
      selectedPatientId: null,
    };

    render(<PatientModal />);

    expect(screen.queryByLabelText(/página web/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/avatar/i)).not.toBeInTheDocument();
  });

  it('calls addPatient with PatientFormData (webpage/avatar default to empty) and closes modal on valid submit', async () => {
    const user = userEvent.setup();
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'create',
      selectedPatientId: null,
    };
    mockAddPatient.mockClear();
    mockCloseModal.mockClear();

    render(<PatientModal />);

    const nameInput = screen.getByLabelText(/nombre/i);
    const descInput = screen.getByLabelText(/descripción/i);

    await user.clear(nameInput);
    await user.type(nameInput, 'Nuevo Paciente');
    await user.clear(descInput);
    await user.type(descInput, 'Cardiología');

    await user.click(screen.getByRole('button', { name: /crear paciente/i }));

    expect(mockAddPatient).toHaveBeenCalledTimes(1);
    // addPatient receives full PatientFormData — store auto-generates webpage/avatar
    expect(mockAddPatient).toHaveBeenCalledWith({
      name: 'Nuevo Paciente',
      description: 'Cardiología',
      webpage: '',
      avatar: '',
    });
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Edit mode — pre-filled with all editable fields, hidden fields preserved by store
// ============================================================================

describe('Edit mode', () => {
  it('renders Modal with edit title and PatientForm pre-filled with all editable fields', () => {
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'edit',
      selectedPatientId: 'p1',
    };

    render(<PatientModal />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Editar paciente')).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Carlos López');
    expect(screen.getByLabelText(/descripción/i)).toHaveValue('Neurología');
    // Webpage and avatar are now visible in edit mode
    expect(screen.getByLabelText(/página web/i)).toHaveValue(
      'https://carlos.example.com',
    );
    expect(screen.getByLabelText(/avatar/i)).toHaveValue(
      'https://carlos.example.com/avatar.jpg',
    );
  });

  it('calls updatePatient(id, formData) with all editable fields and closes modal', async () => {
    const user = userEvent.setup();
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'edit',
      selectedPatientId: 'p1',
    };
    mockUpdatePatient.mockClear();
    mockCloseModal.mockClear();

    render(<PatientModal />);

    const nameInput = screen.getByLabelText(/nombre/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Carlos Actualizado');

    await user.click(
      screen.getByRole('button', { name: /guardar cambios/i }),
    );

    expect(mockUpdatePatient).toHaveBeenCalledTimes(1);
    // updatePatient(id, data) — all editable fields included
    expect(mockUpdatePatient).toHaveBeenCalledWith('p1', {
      name: 'Carlos Actualizado',
      description: 'Neurología',
      webpage: 'https://carlos.example.com',
      avatar: 'https://carlos.example.com/avatar.jpg',
    });
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Edit with unknown patient — not found state
// ============================================================================

describe('Patient not found', () => {
  it('shows "Paciente no encontrado" message and close button when patient does not exist', () => {
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'edit',
      selectedPatientId: 'unknown',
    };

    render(<PatientModal />);

    expect(screen.getByText('Paciente no encontrado')).toBeInTheDocument();
    expect(screen.queryByLabelText(/nombre/i)).not.toBeInTheDocument();
    const closeButtons = screen.getAllByRole('button', { name: /cerrar/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('allows closing via the close button in not-found state', async () => {
    const user = userEvent.setup();
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'edit',
      selectedPatientId: 'unknown',
    };
    mockCloseModal.mockClear();

    render(<PatientModal />);

    await user.click(screen.getAllByRole('button', { name: /cerrar/i })[1]);
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Closed state & close behavior
// ============================================================================

describe('Closed and close behavior', () => {
  it('renders nothing when modal is closed (isOpen=false)', () => {
    modalStoreState = {
      ...defaultModalState(),
      isOpen: false,
      mode: 'create',
      selectedPatientId: null,
    };

    render(<PatientModal />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal when overlay is clicked', async () => {
    const user = userEvent.setup();
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'create',
      selectedPatientId: null,
    };
    mockCloseModal.mockClear();

    render(<PatientModal />);

    const overlay = screen.getByTestId('modal-overlay');
    await user.click(overlay);

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });

  it('closes modal when Escape is pressed', async () => {
    const user = userEvent.setup();
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'create',
      selectedPatientId: null,
    };
    mockCloseModal.mockClear();

    render(<PatientModal />);

    await user.keyboard('{Escape}');
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Toast wiring — REQ-TW-01 & REQ-TW-02
// ============================================================================

describe('Toast wiring on successful submit', () => {
  it('calls showSuccess("Paciente creado correctamente") after create succeeds and modal closes', async () => {
    const user = userEvent.setup();
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'create',
      selectedPatientId: null,
    };
    mockAddPatient.mockClear();
    mockCloseModal.mockClear();
    toastSpy.showSuccess.mockClear();

    render(<PatientModal />);

    const nameInput = screen.getByLabelText(/nombre/i);
    const descInput = screen.getByLabelText(/descripción/i);

    await user.clear(nameInput);
    await user.type(nameInput, 'Nuevo Paciente');
    await user.clear(descInput);
    await user.type(descInput, 'Cardiología');

    await user.click(screen.getByRole('button', { name: /crear paciente/i }));

    expect(toastSpy.showSuccess).toHaveBeenCalledWith(
      'Paciente creado correctamente',
    );
    expect(mockAddPatient).toHaveBeenCalledTimes(1);
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });

  it('calls showSuccess("Cambios guardados") after edit succeeds and modal closes', async () => {
    const user = userEvent.setup();
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'edit',
      selectedPatientId: 'p1',
    };
    mockUpdatePatient.mockClear();
    mockCloseModal.mockClear();
    toastSpy.showSuccess.mockClear();

    render(<PatientModal />);

    const nameInput = screen.getByLabelText(/nombre/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Carlos Actualizado');

    await user.click(
      screen.getByRole('button', { name: /guardar cambios/i }),
    );

    expect(toastSpy.showSuccess).toHaveBeenCalledWith('Cambios guardados');
    expect(mockUpdatePatient).toHaveBeenCalledTimes(1);
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});

describe('Toast NOT shown on validation failure', () => {
  it('does NOT call showSuccess when create form is invalid (empty required fields)', async () => {
    const user = userEvent.setup();
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'create',
      selectedPatientId: null,
    };
    toastSpy.showSuccess.mockClear();
    mockAddPatient.mockClear();
    mockCloseModal.mockClear();

    render(<PatientModal />);

    // Submit without filling required fields — Zod validation blocks onSubmit
    await user.click(screen.getByRole('button', { name: /crear paciente/i }));

    expect(toastSpy.showSuccess).not.toHaveBeenCalled();
    expect(mockAddPatient).not.toHaveBeenCalled();
  });

  it('does NOT call showSuccess when edit form is invalid (empty name)', async () => {
    const user = userEvent.setup();
    modalStoreState = {
      ...defaultModalState(),
      isOpen: true,
      mode: 'edit',
      selectedPatientId: 'p1',
    };
    toastSpy.showSuccess.mockClear();
    mockUpdatePatient.mockClear();
    mockCloseModal.mockClear();

    render(<PatientModal />);

    // Clear the name field to trigger validation
    await user.clear(screen.getByLabelText(/nombre/i));

    await user.click(
      screen.getByRole('button', { name: /guardar cambios/i }),
    );

    expect(toastSpy.showSuccess).not.toHaveBeenCalled();
    expect(mockUpdatePatient).not.toHaveBeenCalled();
  });
});
