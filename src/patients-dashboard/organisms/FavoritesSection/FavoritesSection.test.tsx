import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoritesSection from '@/patients-dashboard/organisms/FavoritesSection';
import { createPatient } from '../../../../test/fixtures/patient.fixture';

// ---------------------------------------------------------------------------
// Mocks — hoisted before component import
// ---------------------------------------------------------------------------

// Mock PatientCard to keep section tests focused on orchestration
vi.mock('@/patients-dashboard/organisms/PatientCard', () => ({
  default: vi.fn(
    ({ patient }: { patient: { id: string; name: string } }) => (
      <article data-testid={patient.id} data-name={patient.name}>
        {patient.name}
      </article>
    ),
  ),
}));

import PatientCard from '@/patients-dashboard/organisms/PatientCard';

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
  patients: Array<{ id: string; name: string; description: string; website: string; avatar: string }>;
  searchQuery: string;
} = {
  patients: [],
  searchQuery: '',
};

vi.mock('@/patients-dashboard/store/patients.store', () => ({
  usePatientsStore: vi.fn((selector?: (state: typeof patientsState) => unknown) => {
    if (typeof selector === 'function') return selector(patientsState);
    return patientsState;
  }),
  selectPatients: (state: typeof patientsState) => state.patients,
  selectPatientsSearchQuery: (state: typeof patientsState) => state.searchQuery,
}));

// No-op toast.store mock
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

function setPatientsState(patients: Array<{ id: string; name: string; description: string; website: string; avatar: string }>, searchQuery = '') {
  patientsState = { patients, searchQuery };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.mocked(PatientCard).mockClear();
});

describe('FavoritesSection', () => {
  it('renders an accessible section landmark with name "Favoritos"', () => {
    setFavoritesState([]);
    setPatientsState([]);
    render(<FavoritesSection />);

    const section = screen.getByRole('region', { name: 'Favoritos' });
    expect(section).toBeInTheDocument();

    const heading = screen.getByRole('heading', { name: 'Favoritos', level: 2 });
    expect(heading).toBeInTheDocument();
    expect(section.contains(heading)).toBe(true);
  });

  it('links aria-labelledby to its own h2 heading', () => {
    setFavoritesState([]);
    setPatientsState([]);
    render(<FavoritesSection />);

    const section = screen.getByRole('region', { name: 'Favoritos' });
    const heading = screen.getByRole('heading', { name: 'Favoritos', level: 2 });

    const labelledBy = section.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(heading.id).toBe(labelledBy);
  });

  it('renders compact empty state when there are no favorites', () => {
    setFavoritesState([]);
    setPatientsState([]);
    render(<FavoritesSection />);

    expect(screen.getByText(/No tienes Pacientes Favoritos/i)).toBeInTheDocument();

    const section = screen.getByRole('region', { name: /favoritos/i });
    const svg = section.querySelector('svg');
    expect(svg).toBeInTheDocument();

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

  it('shows empty state message when patients not yet loaded', () => {
    setFavoritesState(['p1']);
    setPatientsState([]);
    render(<FavoritesSection />);

    expect(screen.getByText(/No tienes Pacientes Favoritos/i)).toBeInTheDocument();
  });

  it('shows empty state when favorites are orphaned (no matching patients)', () => {
    setFavoritesState(['orphan-1']);
    setPatientsState([createPatient({ id: 'p1', name: 'Existing' })], '');
    render(<FavoritesSection />);

    expect(screen.getByText(/No tienes Pacientes Favoritos/i)).toBeInTheDocument();
  });

  it('renders a responsive grid of PatientCards when favorites exist', () => {
    setFavoritesState(['p1', 'p2']);
    setPatientsState([
      createPatient({ id: 'p1', name: 'Ana García' }),
      createPatient({ id: 'p2', name: 'Juan Pérez' }),
    ]);
    render(<FavoritesSection />);

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Ana García');
    expect(cards[1]).toHaveTextContent('Juan Pérez');
  });

  it('paginates favorite patients client-side (3 per page)', async () => {
    const user = userEvent.setup();
    setFavoritesState(['p1', 'p2', 'p3', 'p4']);
    setPatientsState([
      createPatient({ id: 'p1', name: 'Ana' }),
      createPatient({ id: 'p2', name: 'Juan' }),
      createPatient({ id: 'p3', name: 'María' }),
      createPatient({ id: 'p4', name: 'Luis' }),
    ]);
    render(<FavoritesSection />);

    // Page 1: 3 cards
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument();
    expect(screen.queryByText('Luis')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Page 2: 1 card
    expect(screen.getByText(/página 2 de 2/i)).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('Luis')).toBeInTheDocument();
  });

  it('announces page changes with aria-live', () => {
    setFavoritesState(['p1', 'p2', 'p3', 'p4']);
    setPatientsState([
      createPatient({ id: 'p1', name: 'Ana' }),
      createPatient({ id: 'p2', name: 'Juan' }),
      createPatient({ id: 'p3', name: 'María' }),
      createPatient({ id: 'p4', name: 'Luis' }),
    ]);
    render(<FavoritesSection />);

    const pageIndicator = screen.getByText(/página 1 de 2/i);
    expect(pageIndicator).toHaveAttribute('aria-live', 'polite');
  });

  it('handles orphan favorite IDs gracefully (IDs not found in patients)', () => {
    setFavoritesState(['p1', 'p99']);
    setPatientsState([createPatient({ id: 'p1', name: 'Ana García' })]);
    render(<FavoritesSection />);

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Ana García');

    expect(screen.getByText('1 paciente guardado')).toBeInTheDocument();
  });

  it('shows empty state when favorites exist but no patients match', () => {
    setFavoritesState(['p1', 'p2']);
    setPatientsState([]);
    render(<FavoritesSection />);

    expect(
      screen.getByRole('heading', { name: /No tienes Pacientes Favoritos/i }),
    ).toBeInTheDocument();

    expect(screen.getByText('0 pacientes guardados')).toBeInTheDocument();
    expect(screen.queryByText('2 pacientes guardados')).not.toBeInTheDocument();
  });

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

  describe('Orphan messaging — unified', () => {
    it('shows unified empty state when favorites are orphaned regardless of search', () => {
      setFavoritesState(['orphan-1']);
      setPatientsState(
        [createPatient({ id: 'p1', name: 'Existing' })],
        'smith',
      );
      render(<FavoritesSection />);

      expect(screen.getByText(/No tienes Pacientes Favoritos/i)).toBeInTheDocument();
    });

    it('shows same unified message when no search is active', () => {
      setFavoritesState(['orphan-1']);
      setPatientsState(
        [createPatient({ id: 'p1', name: 'Existing' })],
        '',
      );
      render(<FavoritesSection />);

      expect(screen.getByText(/No tienes Pacientes Favoritos/i)).toBeInTheDocument();
    });
  });
});
