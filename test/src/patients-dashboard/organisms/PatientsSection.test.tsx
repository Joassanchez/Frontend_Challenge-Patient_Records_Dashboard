import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

// Re-import after mock to access the mocked version
import PatientCard from '@/patients-dashboard/organisms/PatientCard';

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
});
