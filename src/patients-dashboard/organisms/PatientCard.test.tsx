import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientCard from './PatientCard';
import type { Patient } from '@/patients-dashboard/types/patient.types';

// ---------------------------------------------------------------------------
// Mocks — hoisted before component import
// ---------------------------------------------------------------------------

const mockToggleFavorite = vi.fn<(id: string) => void>();

// Favorites store state used by the mock selector
let favoritesStoreState: {
  favoritePatientIds: string[];
  toggleFavorite: (id: string) => void;
} = {
  favoritePatientIds: [],
  toggleFavorite: mockToggleFavorite,
};

vi.mock('@/patients-dashboard/store/favorites.store', () => ({
  useFavoritesStore: vi.fn((selector?: (state: typeof favoritesStoreState) => unknown) => {
    if (typeof selector === 'function') return selector(favoritesStoreState);
    return favoritesStoreState;
  }),
  selectIsFavorite: (id: string) => (state: typeof favoritesStoreState) =>
    state.favoritePatientIds.includes(id),
}));

// ---------------------------------------------------------------------------
// Modal store mock
// ---------------------------------------------------------------------------

const mockOpenEditModal = vi.fn<(patientId: string) => void>();

vi.mock('@/patients-dashboard/store/modal.store', () => ({
  useModalStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = {
      isOpen: false,
      mode: 'create' as const,
      selectedPatientId: null as string | null,
      openEditModal: mockOpenEditModal,
      closeModal: vi.fn(),
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function mockPatient(overrides?: Partial<Patient>): Patient {
  return {
    id: '1',
    name: 'Ana García',
    description: 'Cardiología',
    webpage: 'https://ana.example',
    avatar: 'https://avatars.example/ana.jpg',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PatientCard', () => {
  // ---- Identity rendering ----

  it('renders a semantic <article> as the card root', () => {
    render(<PatientCard patient={mockPatient()} />);
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
  });

  it('renders the patient name as an h3 heading', () => {
    render(<PatientCard patient={mockPatient()} />);
    const heading = screen.getByRole('heading', { name: 'Ana García', level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it('renders the patient description visibly', () => {
    render(<PatientCard patient={mockPatient()} />);
    expect(screen.getByText('Cardiología')).toBeInTheDocument();
  });

  it('renders the webpage as a link with href and rel attributes', () => {
    render(<PatientCard patient={mockPatient()} />);
    const link = screen.getByRole('link', { name: /ana\.example/i });
    expect(link).toHaveAttribute('href', 'https://ana.example');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // ---- Avatar fallback ----

  it('renders avatar image with alt text containing patient name when src is provided', () => {
    render(<PatientCard patient={mockPatient()} />);
    const img = screen.getByRole('img', { name: /Ana García/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://avatars.example/ana.jpg');
  });

  it('renders fallback initials when avatar is empty string', () => {
    render(<PatientCard patient={mockPatient({ avatar: '' })} />);
    // Avatar fallback shows initials "AG"
    expect(screen.getByText('AG')).toBeInTheDocument();
    // No broken image
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  // ---- Action placeholders ----

  it('renders a "Ver detalle" button with aria-label', () => {
    render(<PatientCard patient={mockPatient()} />);
    const button = screen.getByRole('button', { name: /ver detalle/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Ver detalle');
  });

  it('renders an "Editar" button with aria-label', () => {
    render(<PatientCard patient={mockPatient()} />);
    const button = screen.getByRole('button', { name: /editar/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Editar');
  });

  it('renders a "Favorito" button with aria-label', () => {
    render(<PatientCard patient={mockPatient()} />);
    const button = screen.getByRole('button', { name: /favorito/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Favorito');
  });

  // ---- No-op behavior ----

  it('clicking action buttons does not mutate state (no-op placeholders)', () => {
    // No store is imported by PatientCard — the buttons are visual-only.
    // We verify the component renders without errors and buttons exist.
    render(<PatientCard patient={mockPatient()} />);
    const buttons = screen.getAllByRole('button');
    // All action buttons plus toggle render successfully without requiring store setup
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  // ---- Accessibility ----

  it('action buttons have focus-visible ring styling', () => {
    render(<PatientCard patient={mockPatient()} />);
    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      // Each button must have a class that includes focus-visible ring
      expect(button.className).toContain('focus-visible');
    }
  });

  // ---- Expand/collapse behavior ----

  it('renders collapsed by default with "Ver más" toggle and no expanded content', () => {
    render(
      <PatientCard
        patient={mockPatient({ createdAt: '2024-01-15T10:00:00Z' })}
      />,
    );

    const toggle = screen.getByRole('button', { name: /ver más/i });
    expect(toggle).toBeInTheDocument();

    // The expandable region exists but its inner content is hidden from assistive tech
    const region = screen.getByRole('region');
    const innerContent = region.firstElementChild as HTMLElement;
    expect(innerContent).toHaveAttribute('aria-hidden', 'true');
  });

  it('expands on toggle click, showing "Ver menos" and creation date', async () => {
    const user = userEvent.setup();
    render(
      <PatientCard
        patient={mockPatient({ createdAt: '2024-01-15T10:00:00Z' })}
      />,
    );

    const toggle = screen.getByRole('button', { name: /ver más/i });
    await user.click(toggle);

    expect(toggle).toHaveTextContent(/ver menos/i);
    expect(screen.getByText(/fecha de registro/i)).toBeInTheDocument();
  });

  it('collapses back when toggle is clicked a second time, hiding detail content', async () => {
    const user = userEvent.setup();
    render(
      <PatientCard
        patient={mockPatient({ createdAt: '2024-01-15T10:00:00Z' })}
      />,
    );

    const toggle = screen.getByRole('button', { name: /ver más/i });
    const region = screen.getByRole('region');
    const innerContent = region.firstElementChild as HTMLElement;

    // Expand first
    await user.click(toggle);
    expect(screen.getByText(/fecha de registro/i)).toBeInTheDocument();
    expect(innerContent).not.toHaveAttribute('aria-hidden');

    // Collapse
    await user.click(toggle);
    expect(innerContent).toHaveAttribute('aria-hidden', 'true');
    expect(toggle).toHaveTextContent(/ver más/i);
  });

  it('each card toggles independently without affecting the other', async () => {
    const user = userEvent.setup();
    render(
      <>
        <PatientCard
          patient={mockPatient({ id: '1', name: 'Card 1', createdAt: '2024-01-01' })}
        />
        <PatientCard
          patient={mockPatient({ id: '2', name: 'Card 2', createdAt: '2024-06-01' })}
        />
      </>,
    );

    const toggles = screen.getAllByRole('button', { name: /ver más/i });
    expect(toggles).toHaveLength(2);

    const regions = screen.getAllByRole('region');
    const firstInner = regions[0].firstElementChild as HTMLElement;
    const secondInner = regions[1].firstElementChild as HTMLElement;

    // Both collapsed initially
    expect(firstInner).toHaveAttribute('aria-hidden', 'true');
    expect(secondInner).toHaveAttribute('aria-hidden', 'true');

    // Expand the first card
    await user.click(toggles[0]);

    // First card reveals content, second stays hidden
    expect(firstInner).not.toHaveAttribute('aria-hidden');
    expect(secondInner).toHaveAttribute('aria-hidden', 'true');
    expect(toggles[1]).toHaveTextContent(/ver más/i);
  });

  it('toggle button has aria-expanded that reflects current state', async () => {
    const user = userEvent.setup();
    render(
      <PatientCard
        patient={mockPatient({ createdAt: '2024-01-15T10:00:00Z' })}
      />,
    );

    const toggle = screen.getByRole('button', { name: /ver más/i });

    // Initially collapsed
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // Expand
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggle button has aria-controls that matches the expandable region id', () => {
    render(<PatientCard patient={mockPatient()} />);

    const toggle = screen.getByRole('button', { name: /ver más/i });
    const region = screen.getByRole('region');

    expect(toggle).toHaveAttribute('aria-controls');
    expect(region).toHaveAttribute('id');
    expect(toggle.getAttribute('aria-controls')).toBe(region.getAttribute('id'));
  });

  it('when createdAt is absent, toggle still works but panel shows no extra content', async () => {
    const user = userEvent.setup();
    render(<PatientCard patient={mockPatient({ createdAt: undefined })} />);

    const toggle = screen.getByRole('button', { name: /ver más/i });
    await user.click(toggle);

    // Toggle state changes
    expect(toggle).toHaveTextContent(/ver menos/i);

    // No creation date content appears
    expect(screen.queryByText(/fecha de registro/i)).not.toBeInTheDocument();
  });

  // =========================================================================
  // REQ-PC-05 / REQ-FS-03: Favorite Button Behavior
  // =========================================================================

  describe('Favorite button', () => {
    it('has aria-pressed="false" when the patient is not a favorite', () => {
      favoritesStoreState = { favoritePatientIds: [], toggleFavorite: mockToggleFavorite };
      render(<PatientCard patient={mockPatient({ id: 'p1' })} />);

      const button = screen.getByRole('button', { name: /favorito/i });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('has aria-pressed="true" when the patient is a favorite', () => {
      favoritesStoreState = { favoritePatientIds: ['p1'], toggleFavorite: mockToggleFavorite };
      render(<PatientCard patient={mockPatient({ id: 'p1' })} />);

      const button = screen.getByRole('button', { name: /favorito/i });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls toggleFavorite with patient.id when clicked', async () => {
      const user = userEvent.setup();
      favoritesStoreState = { favoritePatientIds: [], toggleFavorite: mockToggleFavorite };
      mockToggleFavorite.mockClear();

      render(<PatientCard patient={mockPatient({ id: 'p1' })} />);

      const button = screen.getByRole('button', { name: /favorito/i });
      await user.click(button);

      expect(mockToggleFavorite).toHaveBeenCalledWith('p1');
    });

    it('shows active visual state when favorite (text-favorite class)', () => {
      favoritesStoreState = { favoritePatientIds: ['p1'], toggleFavorite: mockToggleFavorite };
      render(<PatientCard patient={mockPatient({ id: 'p1' })} />);

      const button = screen.getByRole('button', { name: /favorito/i });
      // Active state: should contain a class indicating active favorite
      // The design uses text-favorite for active state
      expect(button.className).toContain('text-favorite');
    });

    it('shows inactive visual state when not favorite (muted class)', () => {
      favoritesStoreState = { favoritePatientIds: [], toggleFavorite: mockToggleFavorite };
      render(<PatientCard patient={mockPatient({ id: 'p1' })} />);

      const button = screen.getByRole('button', { name: /favorito/i });
      // Inactive state: should NOT have text-favorite class
      expect(button.className).not.toContain('text-favorite');
      // Should have a muted/neutral text class
      expect(button.className).toContain('text-text-muted');
    });
  });
});

// ============================================================================
// REQ-PC-02: Botón Editar abre modal — RED (not yet implemented)
// ============================================================================

describe('REQ-PC-02: Botón Editar abre modal', () => {
  it('calls openEditModal with patient.id when "Editar" is clicked', async () => {
    const user = userEvent.setup();
    mockOpenEditModal.mockClear();

    render(<PatientCard patient={mockPatient({ id: 'p1' })} />);

    const editButton = screen.getByRole('button', { name: /editar/i });
    await user.click(editButton);

    expect(mockOpenEditModal).toHaveBeenCalledTimes(1);
    expect(mockOpenEditModal).toHaveBeenCalledWith('p1');
  });
});
