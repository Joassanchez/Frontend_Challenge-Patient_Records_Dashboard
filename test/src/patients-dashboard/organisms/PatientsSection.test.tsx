import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientsSection from '@/patients-dashboard/organisms/PatientsSection';
import { createPatient } from '@test/fixtures/patient.fixture';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock PatientCard to keep section tests focused on orchestration.
// We verify PatientCard receives patient via props through the mock.
// NOTE: factory must NOT reference top-level variables because vi.mock is hoisted.
vi.mock('@/patients-dashboard/organisms/PatientCard', () => ({
  default: vi.fn(
    ({ patient }: { patient: { id: string; name: string } }) => (
      <article data-testid={patient.id} data-name={patient.name}>
        {patient.name}
      </article>
    ),
  ),
}));

// Spy on the store's loadPatients so we can assert call count.
const mockLoadPatients = vi.fn();

// Store state that PatientsSection reads via selectors.
let storeState: {
  patients: Array<{ id: string; name: string; description: string; webpage: string; avatar: string }>;
  isLoading: boolean;
  error: string | null;
  loadPatients: () => Promise<void>;
} = {
  patients: [],
  isLoading: false,
  error: null,
  loadPatients: mockLoadPatients,
};

// Mock usePatientsStore: returns store state + actions.
vi.mock('@/patients-dashboard/store/patients.store', () => ({
  usePatientsStore: vi.fn((selector?: (state: typeof storeState) => unknown) => {
    if (typeof selector === 'function') return selector(storeState);
    return { ...storeState, loadPatients: mockLoadPatients };
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setStoreState(partial: Partial<typeof storeState>) {
  storeState = { ...storeState, ...partial };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  storeState = { patients: [], isLoading: false, error: null, loadPatients: mockLoadPatients };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PatientsSection', () => {
  // ---- Store connection ----

  it('calls loadPatients exactly once on mount', () => {
    render(<PatientsSection />);
    expect(mockLoadPatients).toHaveBeenCalledTimes(1);
  });

  it('does NOT call loadPatients again on parent re-render', () => {
    const { rerender } = render(<PatientsSection />);
    expect(mockLoadPatients).toHaveBeenCalledTimes(1);
    rerender(<PatientsSection />);
    expect(mockLoadPatients).toHaveBeenCalledTimes(1);
  });

  // ---- Loading state ----

  it('renders a loading indicator (Spinner) while isLoading is true', () => {
    setStoreState({ isLoading: true, patients: [], error: null });
    render(<PatientsSection />);
    // Spinner has role="status" and aria-label="Loading"
    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner).toBeInTheDocument();
  });

  it('does NOT render patient cards while loading', () => {
    setStoreState({
      isLoading: true,
      patients: [createPatient({ id: '1', name: 'Ana' })],
      error: null,
    });
    render(<PatientsSection />);
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  // ---- Error state ----

  it('renders the error message from the store as-is when error is set', () => {
    setStoreState({ isLoading: false, patients: [], error: 'Network error' });
    render(<PatientsSection />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('does NOT render patient cards when error is set', () => {
    setStoreState({
      isLoading: false,
      patients: [createPatient({ id: '1', name: 'Ana' })],
      error: 'Network error',
    });
    render(<PatientsSection />);
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('renders error with alert role for accessibility', () => {
    setStoreState({ isLoading: false, patients: [], error: 'Something broke' });
    render(<PatientsSection />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Something broke');
  });

  // ---- Empty state ----

  it('renders an empty state message when patients array is empty and not loading', () => {
    setStoreState({ isLoading: false, patients: [], error: null });
    render(<PatientsSection />);
    expect(screen.getByText(/no hay pacientes/i)).toBeInTheDocument();
  });

  it('does NOT render patient cards in empty state', () => {
    setStoreState({ isLoading: false, patients: [], error: null });
    render(<PatientsSection />);
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  // ---- Success state ----

  it('renders a PatientCard for each patient in the store', () => {
    setStoreState({
      isLoading: false,
      patients: [
        createPatient({ id: '1', name: 'Ana García' }),
        createPatient({ id: '2', name: 'Juan Pérez' }),
        createPatient({ id: '3', name: 'María López' }),
      ],
      error: null,
    });
    render(<PatientsSection />);
    // Our mock PatientCard renders <article> per patient
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);
  });

  it('renders patient name in each card', () => {
    setStoreState({
      isLoading: false,
      patients: [createPatient({ id: 'a', name: 'Ana García' })],
      error: null,
    });
    render(<PatientsSection />);
    expect(screen.getByText('Ana García')).toBeInTheDocument();
  });


  it('renders patients in client-side infinite-scroll batches', async () => {
    const user = userEvent.setup();
    setStoreState({
      isLoading: false,
      patients: Array.from({ length: 7 }, (_, index) =>
        createPatient({
          id: `p${index + 1}`,
          name: `Patient ${index + 1}`,
        }),
      ),
      error: null,
    });
    render(<PatientsSection />);

    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.queryByText('Patient 7')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cargar m.s pacientes/i }));

    expect(screen.getAllByRole('article')).toHaveLength(7);
    expect(screen.getByText('Patient 7')).toBeInTheDocument();
  });

  // ---- Search normalization ----

  it('matches patients with accented names using unaccented queries', async () => {
    const user = userEvent.setup();
    setStoreState({
      isLoading: false,
      patients: [
        createPatient({ id: '1', name: 'Álvaro Gómez', description: 'Cardiólogo' }),
        createPatient({ id: '2', name: 'Andrea Pérez', description: 'Neurología' }),
      ],
      error: null,
    });
    render(<PatientsSection />);

    const searchInput = screen.getByPlaceholderText(/buscar por nombre/i);
    await user.type(searchInput, 'alvaro');

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('Álvaro Gómez')).toBeInTheDocument();
    expect(screen.queryByText('Andrea Pérez')).not.toBeInTheDocument();
  });
});
