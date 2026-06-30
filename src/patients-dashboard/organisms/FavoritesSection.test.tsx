import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FavoritesSection from './FavoritesSection';
import { createPatient } from '@/test/fixtures/patient.fixture';

// ---------------------------------------------------------------------------
// Mocks — hoisted before component import
// ---------------------------------------------------------------------------

// Mock PatientCard to keep section tests focused on orchestration
vi.mock('./PatientCard', () => ({
  default: vi.fn(
    ({ patient }: { patient: { id: string; name: string } }) => (
      <article data-testid={patient.id} data-name={patient.name}>
        {patient.name}
      </article>
    ),
  ),
}));

import PatientCard from './PatientCard';

// --- Favorites store mock ---
let favoritesState: { favoritePatientIds: string[] } = {
  favoritePatientIds: [],
};

vi.mock('@/patients-dashboard/store/favorites.store', () => ({
  useFavoritesStore: vi.fn((selector?: (state: typeof favoritesState) => unknown) => {
    if (typeof selector === 'function') return selector(favoritesState);
    return favoritesState;
  }),
  selectFavoriteIds: (state: typeof favoritesState) => state.favoritePatientIds,
  selectFavoritesCount: (state: typeof favoritesState) => state.favoritePatientIds.length,
}));

// --- Patients store mock ---
let patientsState: {
  patients: Array<{ id: string; name: string; description: string; webpage: string; avatar: string }>;
} = {
  patients: [],
};

vi.mock('@/patients-dashboard/store/patients.store', () => ({
  usePatientsStore: vi.fn((selector?: (state: typeof patientsState) => unknown) => {
    if (typeof selector === 'function') return selector(patientsState);
    return patientsState;
  }),
  selectPatients: (state: typeof patientsState) => state.patients,
}));

// No-op toast.store mock — FavoritesSection does not use toasts directly,
// but it renders components (PatientCard) that may read the store.
vi.mock('@/patients-dashboard/store/toast.store', () => ({
  useToastStore: vi.fn((selector?: (state: unknown) => unknown) => {
    const state = {
      toasts: [],
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn(),
      showWarning: vi.fn(),
      dismissToast: vi.fn(),
      clearToasts: vi.fn(),
      resetStore: vi.fn(),
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
  selectToasts: () => [],
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setFavoritesState(ids: string[]) {
  favoritesState = { favoritePatientIds: ids };
}

function setPatientsState(patients: Array<{ id: string; name: string; description: string; webpage: string; avatar: string }>) {
  patientsState = { patients };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// Reset mock call history between tests
beforeEach(() => {
  vi.mocked(PatientCard).mockClear();
});

describe('FavoritesSection', () => {
  // ---- Accessibility (preserved from existing tests) ----

  it('renders an accessible section landmark with name "Favoritos"', () => {
    setFavoritesState([]);
    setPatientsState([]);
    render(<FavoritesSection />);

    const section = screen.getByRole('region', { name: 'Favoritos' });
    expect(section).toBeInTheDocument();

    const heading = screen.getByRole('heading', {
      name: 'Favoritos',
      level: 2,
    });
    expect(heading).toBeInTheDocument();
    expect(section.contains(heading)).toBe(true);
  });

  it('links aria-labelledby to its own h2 heading', () => {
    setFavoritesState([]);
    setPatientsState([]);
    render(<FavoritesSection />);

    const section = screen.getByRole('region', { name: 'Favoritos' });
    const heading = screen.getByRole('heading', {
      name: 'Favoritos',
      level: 2,
    });

    const labelledBy = section.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(heading.id).toBe(labelledBy);
  });

  // ---- REQ-DL-02: Empty state ----

  it('renders compact empty state when there are no favorites', () => {
    setFavoritesState([]);
    setPatientsState([]);
    render(<FavoritesSection />);

    // Descriptive message about no favorites still visible
    expect(
      screen.getByText(/todavía no marcaste favoritos/i),
    ).toBeInTheDocument();

    // The inbox icon must be rendered
    const section = screen.getByRole('region', { name: /favoritos/i });
    const svg = section.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Compact variant: uses reduced padding (py-8), not full padding (py-16)
    const emptyContainer = svg!.parentElement!;
    expect(emptyContainer.className).toContain('py-8');
    expect(emptyContainer.className).not.toContain('py-16');
  });

  it('remains visible even when empty', () => {
    setFavoritesState([]);
    setPatientsState([]);
    render(<FavoritesSection />);

    const section = screen.getByRole('region', { name: /favoritos/i });
    expect(section).toBeInTheDocument();
  });

  // ---- REQ-DL-02: Grid of favorite patients ----

  it('renders a responsive grid of PatientCards when favorites exist', () => {
    setFavoritesState(['p1', 'p2']);
    setPatientsState([createPatient({ id: 'p1', name: 'Ana García' }), createPatient({ id: 'p2', name: 'Juan Pérez' })]);
    render(<FavoritesSection />);

    // Two cards should be rendered
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Ana García');
    expect(cards[1]).toHaveTextContent('Juan Pérez');
  });

  // ---- REQ-DL-09: Join between favorites and patients ----

  it('handles orphan favorite IDs gracefully (IDs not found in patients)', () => {
    // p99 is favorited but doesn't exist in patients — should be silently ignored
    setFavoritesState(['p1', 'p99']);
    setPatientsState([createPatient({ id: 'p1', name: 'Ana García' })]);
    render(<FavoritesSection />);

    // Only Ana's card should render
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Ana García');

    // Counter must use matched count (1), not localStorage count (2)
    expect(screen.getByText('1 paciente guardado')).toBeInTheDocument();
  });

  it('shows empty state when favorites exist but no patients match', () => {
    // Favorites have IDs but patients array doesn't contain them yet
    setFavoritesState(['p1', 'p2']);
    setPatientsState([]);
    render(<FavoritesSection />);

    // Should show a graceful empty message heading (patients not loaded yet)
    expect(
      screen.getByRole('heading', { name: /tus favoritos aparecerán acá/i }),
    ).toBeInTheDocument();

    // Counter must show 0 (matched count), NOT the localStorage count (2)
    expect(screen.getByText('0 pacientes guardados')).toBeInTheDocument();
    expect(screen.queryByText('2 pacientes guardados')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Section Counter — REQ-COUNTERS-01
  // ===========================================================================

  describe('Section counter', () => {
    it('shows "N pacientes guardados" for plural count', () => {
      setFavoritesState(['p1', 'p2', 'p3']);
      setPatientsState([
        createPatient({ id: 'p1', name: 'Ana' }),
        createPatient({ id: 'p2', name: 'Juan' }),
        createPatient({ id: 'p3', name: 'María' }),
      ]);
      render(<FavoritesSection />);
      expect(screen.getByText('3 pacientes guardados')).toBeInTheDocument();
    });

    it('shows "1 paciente guardado" for singular count', () => {
      setFavoritesState(['p1']);
      setPatientsState([createPatient({ id: 'p1', name: 'Ana' })]);
      render(<FavoritesSection />);
      expect(screen.getByText('1 paciente guardado')).toBeInTheDocument();
    });

    it('shows "0 pacientes guardados" when there are no favorites', () => {
      setFavoritesState([]);
      setPatientsState([]);
      render(<FavoritesSection />);
      expect(screen.getByText('0 pacientes guardados')).toBeInTheDocument();
    });


  });
});
