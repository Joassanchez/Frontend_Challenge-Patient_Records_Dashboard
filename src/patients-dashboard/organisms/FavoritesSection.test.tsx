import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FavoritesSection from './FavoritesSection';

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

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function createPatient(id: string, name: string) {
  return { id, name, description: 'Desc', webpage: `https://${id}.example`, avatar: '' };
}

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

  it('applies optional className prop', () => {
    setFavoritesState([]);
    setPatientsState([]);
    render(<FavoritesSection className="test-extra" />);

    const section = screen.getByRole('region', { name: 'Favoritos' });
    expect(section.className).toContain('test-extra');
  });

  // ---- REQ-DL-02: Empty state ----

  it('renders empty state with inbox icon when there are no favorites', () => {
    setFavoritesState([]);
    setPatientsState([]);
    render(<FavoritesSection />);

    // Descriptive message about no favorites
    expect(
      screen.getByText(/todavía no marcaste favoritos/i),
    ).toBeInTheDocument();

    // The inbox icon must be rendered inside the section
    const section = screen.getByRole('region', { name: /favoritos/i });
    const svg = section.querySelector('svg');
    expect(svg).toBeInTheDocument();

    const path = svg!.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path!.getAttribute('d')).toContain('M22 12h-6l-2 3');
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
    setPatientsState([createPatient('p1', 'Ana García'), createPatient('p2', 'Juan Pérez')]);
    render(<FavoritesSection />);

    // Two cards should be rendered
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Ana García');
    expect(cards[1]).toHaveTextContent('Juan Pérez');
  });

  it('passes each patient to PatientCard as prop', () => {
    setFavoritesState(['x1', 'x2']);
    setPatientsState([createPatient('x1', 'Ana'), createPatient('x2', 'Juan')]);
    render(<FavoritesSection />);

    const calls = vi.mocked(PatientCard).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0]?.[0]?.patient).toMatchObject({ id: 'x1', name: 'Ana' });
    expect(calls[1]?.[0]?.patient).toMatchObject({ id: 'x2', name: 'Juan' });
  });

  it('uses responsive grid classes matching PatientsSection', () => {
    setFavoritesState(['p1']);
    setPatientsState([createPatient('p1', 'Ana')]);
    render(<FavoritesSection />);

    const section = screen.getByRole('region', { name: /favoritos/i });
    const grid = section.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    // Verify responsive grid classes
    expect(grid!.className).toContain('grid-cols-1');
    expect(grid!.className).toContain('md:grid-cols-2');
    expect(grid!.className).toContain('lg:grid-cols-3');
  });

  // ---- REQ-DL-09: Join between favorites and patients ----

  it('handles orphan favorite IDs gracefully (IDs not found in patients)', () => {
    // p99 is favorited but doesn't exist in patients — should be silently ignored
    setFavoritesState(['p1', 'p99']);
    setPatientsState([createPatient('p1', 'Ana García')]);
    render(<FavoritesSection />);

    // Only Ana's card should render
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Ana García');
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
  });
});
