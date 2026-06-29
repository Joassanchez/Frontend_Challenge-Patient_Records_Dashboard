import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientModal from './PatientModal';
import type { Patient } from '@/patients-dashboard/types/patient.types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const existingPatient: Patient = {
  id: 'p1',
  name: 'Carlos López',
  description: 'Neurología',
  webpage: 'https://carlos.example.com',
  avatar: 'https://carlos.example.com/avatar.jpg',
  createdAt: '2024-01-15T10:00:00Z',
};

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
});

// ============================================================================
// REQ-PM-01: Orquestación create
// ============================================================================

describe('REQ-PM-01: Orquestación create', () => {
  it('renders Modal with create title and PatientForm with empty defaults when mode is create', () => {
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

  it('calls addPatient and closeModal on valid create submit', async () => {
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
    const webInput = screen.getByLabelText(/página web/i);
    const avatarInput = screen.getByLabelText(/avatar/i);

    await user.clear(nameInput);
    await user.type(nameInput, 'Nuevo Paciente');
    await user.clear(descInput);
    await user.type(descInput, 'Cardiología');
    await user.clear(webInput);
    await user.type(webInput, 'https://nuevo.example.com');
    await user.clear(avatarInput);
    await user.type(avatarInput, 'https://nuevo.example.com/avatar.jpg');

    await user.click(screen.getByRole('button', { name: /crear paciente/i }));

    expect(mockAddPatient).toHaveBeenCalledTimes(1);
    expect(mockAddPatient).toHaveBeenCalledWith({
      name: 'Nuevo Paciente',
      description: 'Cardiología',
      webpage: 'https://nuevo.example.com',
      avatar: 'https://nuevo.example.com/avatar.jpg',
    });
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// REQ-PM-02: Orquestación edit
// ============================================================================

describe('REQ-PM-02: Orquestación edit', () => {
  it('renders Modal with edit title and PatientForm pre-filled with patient data', () => {
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
    expect(
      screen.getByLabelText(/página web/i),
    ).toHaveValue('https://carlos.example.com');
  });

  it('calls updatePatient with merged data and closeModal on valid edit submit', async () => {
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
    expect(mockUpdatePatient).toHaveBeenCalledWith({
      ...existingPatient,
      name: 'Carlos Actualizado',
    });
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// REQ-PM-03: Edit con paciente inexistente
// ============================================================================

describe('REQ-PM-03: Paciente no encontrado', () => {
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
// REQ-PM-05: Composición Modal + PatientForm
// ============================================================================

describe('REQ-PM-05: Composición y cerrado', () => {
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
