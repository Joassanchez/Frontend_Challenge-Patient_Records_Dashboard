import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientCard from './PatientCard';
import { createPatient } from '@/test/fixtures/patient.fixture';

// ---------------------------------------------------------------------------
// Toast store mock (vi.hoisted spies, inline factory)
// ---------------------------------------------------------------------------

const { toastSpies } = vi.hoisted(() => ({
  toastSpies: {
    showSuccess: vi.fn<(message: string, duration?: number) => void>(),
    showInfo: vi.fn<(message: string, duration?: number) => void>(),
  },
}));

vi.mock('@/patients-dashboard/store/toast.store', () => ({
  useToastStore: vi.fn((selector?: (state: unknown) => unknown) => {
    const state = {
      toasts: [] as unknown[],
      showSuccess: toastSpies.showSuccess,
      showInfo: toastSpies.showInfo,
      showError: vi.fn(),
      showWarning: vi.fn(),
      showToast: vi.fn(),
      dismissToast: vi.fn(),
      clearToasts: vi.fn(),
      resetStore: vi.fn(),
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
}));

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
// Tests
// ---------------------------------------------------------------------------

describe('PatientCard', () => {
  // ---- Identity rendering ----

  it('renders a semantic <article> as the card root', () => {
    render(<PatientCard patient={createPatient()} />);
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
  });

  it('renders the patient name as an h3 heading', () => {
    render(<PatientCard patient={createPatient()} />);
    const heading = screen.getByRole('heading', { name: 'Ana García', level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it('renders the patient description visibly', () => {
    render(<PatientCard patient={createPatient()} />);
    expect(screen.getByText('Paciente de neurología')).toBeInTheDocument();
  });

  it('renders the webpage as a link with href and rel attributes', () => {
    render(<PatientCard patient={createPatient()} />);
    const link = screen.getByRole('link', { name: /example\.com/i });
    expect(link).toHaveAttribute('href', 'https://example.com/ana');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // ---- Avatar fallback ----

  it('renders avatar image with alt text containing patient name when src is provided', () => {
    render(<PatientCard patient={createPatient()} />);
    const img = screen.getByRole('img', { name: /Ana García/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://i.pravatar.cc/150?u=ana');
  });

  it('renders fallback initials when avatar is empty string', () => {
    render(<PatientCard patient={createPatient({ avatar: '' })} />);
    expect(screen.getByText('AG')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  // ---- Action buttons: Editar + Favorito only, no "Ver detalle" ----

  it('does NOT render a "Ver detalle" button', () => {
    render(<PatientCard patient={createPatient()} />);
    expect(screen.queryByRole('button', { name: /ver detalle/i })).not.toBeInTheDocument();
  });

  it('renders an "Editar" button', () => {
    render(<PatientCard patient={createPatient()} />);
    const button = screen.getByRole('button', { name: /editar/i });
    expect(button).toBeInTheDocument();
  });

  it('calls openEditModal with patient.id when "Editar" is clicked', async () => {
    const user = userEvent.setup();
    mockOpenEditModal.mockClear();

    render(<PatientCard patient={createPatient({ id: 'p1' })} />);

    const editButton = screen.getByRole('button', { name: /editar/i });
    await user.click(editButton);

    expect(mockOpenEditModal).toHaveBeenCalledTimes(1);
    expect(mockOpenEditModal).toHaveBeenCalledWith('p1');
  });

  it('renders a "Favorito" button', () => {
    render(<PatientCard patient={createPatient()} />);
    const button = screen.getByRole('button', { name: /favorito/i });
    expect(button).toBeInTheDocument();
  });

  // ---- Description collapse/expand contract ----

  it('collapsed card applies line-clamp to description', () => {
    render(
      <PatientCard
        patient={createPatient({
          description:
            'Esta es una descripción muy larga que debería estar truncada con line-clamp-2 en el estado colapsado del card',
        })}
      />,
    );
    // Collapsed by default — description element should have line-clamp-2
    const description = screen.getByText(/descripción muy larga/);
    expect(description.className).toContain('line-clamp-2');
  });

  it('expanded card shows full description without line-clamp', async () => {
    const user = userEvent.setup();
    render(
      <PatientCard
        patient={createPatient({
          description:
            'Esta es una descripción muy larga que debería estar truncada con line-clamp-2 en el estado colapsado del card',
          createdAt: '2024-01-15T10:00:00Z',
        })}
      />,
    );

    // Expand the card
    const toggle = screen.getByRole('button', { name: /ver más/i });
    await user.click(toggle);

    // Description should now be visible without line-clamp
    const description = screen.getByText(/descripción muy larga/);
    expect(description.className).not.toContain('line-clamp-2');
  });

  // ---- Expand/collapse behavior (preserved from existing tests) ----

  it('renders collapsed by default with "Ver más" toggle', () => {
    render(
      <PatientCard
        patient={createPatient({ createdAt: '2024-01-15T10:00:00Z' })}
      />,
    );

    const toggle = screen.getByRole('button', { name: /ver más/i });
    expect(toggle).toBeInTheDocument();

    const region = screen.getByRole('region');
    const innerContent = region.firstElementChild as HTMLElement;
    expect(innerContent).toHaveAttribute('aria-hidden', 'true');
  });

  it('expands on toggle click, showing "Ver menos" and creation date', async () => {
    const user = userEvent.setup();
    render(
      <PatientCard
        patient={createPatient({ createdAt: '2024-01-15T10:00:00Z' })}
      />,
    );

    const toggle = screen.getByRole('button', { name: /ver más/i });
    await user.click(toggle);

    expect(toggle).toHaveTextContent(/ver menos/i);
    expect(screen.getByText(/fecha de registro/i)).toBeInTheDocument();
  });

  it('collapses back when toggle is clicked a second time', async () => {
    const user = userEvent.setup();
    render(
      <PatientCard
        patient={createPatient({ createdAt: '2024-01-15T10:00:00Z' })}
      />,
    );

    const toggle = screen.getByRole('button', { name: /ver más/i });
    const region = screen.getByRole('region');
    const innerContent = region.firstElementChild as HTMLElement;

    await user.click(toggle);
    expect(screen.getByText(/fecha de registro/i)).toBeInTheDocument();
    expect(innerContent).not.toHaveAttribute('aria-hidden');

    await user.click(toggle);
    expect(innerContent).toHaveAttribute('aria-hidden', 'true');
    expect(toggle).toHaveTextContent(/ver más/i);
  });

  it('each card toggles independently', async () => {
    const user = userEvent.setup();
    render(
      <>
        <PatientCard
          patient={createPatient({ id: '1', name: 'Card 1', createdAt: '2024-01-01' })}
        />
        <PatientCard
          patient={createPatient({ id: '2', name: 'Card 2', createdAt: '2024-06-01' })}
        />
      </>,
    );

    const toggles = screen.getAllByRole('button', { name: /ver más/i });
    expect(toggles).toHaveLength(2);

    const regions = screen.getAllByRole('region');
    const firstInner = regions[0].firstElementChild as HTMLElement;
    const secondInner = regions[1].firstElementChild as HTMLElement;

    expect(firstInner).toHaveAttribute('aria-hidden', 'true');
    expect(secondInner).toHaveAttribute('aria-hidden', 'true');

    await user.click(toggles[0]);

    expect(firstInner).not.toHaveAttribute('aria-hidden');
    expect(secondInner).toHaveAttribute('aria-hidden', 'true');
    expect(toggles[1]).toHaveTextContent(/ver más/i);
  });

  it('toggle button has aria-expanded that reflects current state', async () => {
    const user = userEvent.setup();
    render(
      <PatientCard
        patient={createPatient({ createdAt: '2024-01-15T10:00:00Z' })}
      />,
    );

    const toggle = screen.getByRole('button', { name: /ver más/i });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggle button has aria-controls that matches the expandable region id', () => {
    render(<PatientCard patient={createPatient()} />);

    const toggle = screen.getByRole('button', { name: /ver más/i });
    const region = screen.getByRole('region');

    expect(toggle).toHaveAttribute('aria-controls');
    expect(region).toHaveAttribute('id');
    expect(toggle.getAttribute('aria-controls')).toBe(region.getAttribute('id'));
  });

  it('when createdAt is absent, toggle still works but panel shows no extra content', async () => {
    const user = userEvent.setup();
    render(<PatientCard patient={createPatient({ createdAt: undefined })} />);

    const toggle = screen.getByRole('button', { name: /ver más/i });
    await user.click(toggle);

    expect(toggle).toHaveTextContent(/ver menos/i);
    expect(screen.queryByText(/fecha de registro/i)).not.toBeInTheDocument();
  });

  // =========================================================================
  // Favorite Button Behavior (preserved)
  // =========================================================================

  describe('Favorite button', () => {
    it('has aria-pressed="false" when the patient is not a favorite', () => {
      favoritesStoreState = { favoritePatientIds: [], toggleFavorite: mockToggleFavorite };
      render(<PatientCard patient={createPatient({ id: 'p1' })} />);

      const button = screen.getByRole('button', { name: /favorito/i });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('has aria-pressed="true" when the patient is a favorite', () => {
      favoritesStoreState = { favoritePatientIds: ['p1'], toggleFavorite: mockToggleFavorite };
      render(<PatientCard patient={createPatient({ id: 'p1' })} />);

      const button = screen.getByRole('button', { name: /favorito/i });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls toggleFavorite with patient.id when clicked', async () => {
      const user = userEvent.setup();
      favoritesStoreState = { favoritePatientIds: [], toggleFavorite: mockToggleFavorite };
      mockToggleFavorite.mockClear();

      render(<PatientCard patient={createPatient({ id: 'p1' })} />);

      const button = screen.getByRole('button', { name: /favorito/i });
      await user.click(button);

      expect(mockToggleFavorite).toHaveBeenCalledWith('p1');
    });

    it('shows active visual state when favorite (text-favorite class)', () => {
      favoritesStoreState = { favoritePatientIds: ['p1'], toggleFavorite: mockToggleFavorite };
      render(<PatientCard patient={createPatient({ id: 'p1' })} />);

      const button = screen.getByRole('button', { name: /favorito/i });
      expect(button.className).toContain('text-favorite');
    });

    it('shows inactive visual state when not favorite', () => {
      favoritesStoreState = { favoritePatientIds: [], toggleFavorite: mockToggleFavorite };
      render(<PatientCard patient={createPatient({ id: 'p1' })} />);

      const button = screen.getByRole('button', { name: /favorito/i });
      expect(button.className).not.toContain('text-favorite');
    });
  });

  // =========================================================================
  // Actions footer: Editar + Favorito + Ver más/Ver menos in ONE group
  // =========================================================================

  describe('Actions footer', () => {
    it('groups all three actions (Editar, Favorito, Ver más) in a single footer container', () => {
      render(<PatientCard patient={createPatient()} />);

      const buttons = screen.getAllByRole('button');
      const buttonNames = buttons.map((b) => b.textContent?.trim() || '');

      // All three actions must be rendered
      expect(buttonNames).toContain('Editar');
      expect(buttonNames).toContain('Favorito');
      expect(buttonNames).toContain('Ver más');

      // All three buttons should share a common parent (the footer row)
      const editBtn = screen.getByRole('button', { name: /editar/i });
      const favBtn = screen.getByRole('button', { name: /favorito/i });
      const toggleBtn = screen.getByRole('button', { name: /ver más/i });

      // They share the same parent container
      expect(editBtn.parentElement).toBe(favBtn.parentElement);
      expect(editBtn.parentElement).toBe(toggleBtn.parentElement);
    });

    it('does NOT have an orphaned toggle button outside the footer', () => {
      render(<PatientCard patient={createPatient()} />);

      const editBtn = screen.getByRole('button', { name: /editar/i });
      const toggleBtn = screen.getByRole('button', { name: /ver más/i });

      // Both must be in the same parent
      expect(editBtn.parentElement).toBe(toggleBtn.parentElement);
      // And the parent is not the article root (it's a row container)
      expect(editBtn.parentElement?.tagName).not.toBe('ARTICLE');
    });

    it('preserves Editar button behavior (calls openEditModal)', async () => {
      const user = userEvent.setup();
      mockOpenEditModal.mockClear();

      render(<PatientCard patient={createPatient({ id: 'p1' })} />);

      const editBtn = screen.getByRole('button', { name: /editar/i });
      await user.click(editBtn);

      expect(mockOpenEditModal).toHaveBeenCalledWith('p1');
    });

    it('preserves Favorito button behavior (calls toggleFavorite)', async () => {
      const user = userEvent.setup();
      mockToggleFavorite.mockClear();

      render(<PatientCard patient={createPatient({ id: 'p1' })} />);

      const favBtn = screen.getByRole('button', { name: /favorito/i });
      await user.click(favBtn);

      expect(mockToggleFavorite).toHaveBeenCalledWith('p1');
    });

    it('preserves Ver más/Ver menos toggle behavior', async () => {
      const user = userEvent.setup();
      render(
        <PatientCard
          patient={createPatient({ createdAt: '2024-01-15T10:00:00Z' })}
        />,
      );

      const toggle = screen.getByRole('button', { name: /ver más/i });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(toggle).toHaveTextContent(/ver menos/i);

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(toggle).toHaveTextContent(/ver más/i);
    });
  });

  // =========================================================================
  // Toast Wiring (REQ-TW-03, REQ-TW-04)
  // =========================================================================

  describe('Toast wiring — favorite toggle', () => {
    it('REQ-TW-03: calls showSuccess("Agregado a favoritos") when non-favorite patient is favorited', async () => {
      const user = userEvent.setup();
      toastSpies.showSuccess.mockClear();
      toastSpies.showInfo.mockClear();
      mockToggleFavorite.mockClear();

      // Patient is NOT a favorite
      favoritesStoreState = { favoritePatientIds: [], toggleFavorite: mockToggleFavorite };

      render(<PatientCard patient={createPatient({ id: 'p1' })} />);

      const favButton = screen.getByRole('button', { name: /favorito/i });
      await user.click(favButton);

      expect(toastSpies.showSuccess).toHaveBeenCalledWith('Agregado a favoritos');
      expect(toastSpies.showInfo).not.toHaveBeenCalled();
    });

    it('REQ-TW-04: calls showInfo("Quitado de favoritos") when favorite patient is unfavorited', async () => {
      const user = userEvent.setup();
      toastSpies.showSuccess.mockClear();
      toastSpies.showInfo.mockClear();
      mockToggleFavorite.mockClear();

      // Patient IS a favorite
      favoritesStoreState = { favoritePatientIds: ['p1'], toggleFavorite: mockToggleFavorite };

      render(<PatientCard patient={createPatient({ id: 'p1' })} />);

      const favButton = screen.getByRole('button', { name: /favorito/i });
      await user.click(favButton);

      expect(toastSpies.showInfo).toHaveBeenCalledWith('Quitado de favoritos');
      expect(toastSpies.showSuccess).not.toHaveBeenCalled();
    });

    it('still calls toggleFavorite with patient.id when favorite is clicked', async () => {
      const user = userEvent.setup();
      mockToggleFavorite.mockClear();

      favoritesStoreState = { favoritePatientIds: [], toggleFavorite: mockToggleFavorite };

      render(<PatientCard patient={createPatient({ id: 'p1' })} />);

      const favButton = screen.getByRole('button', { name: /favorito/i });
      await user.click(favButton);

      expect(mockToggleFavorite).toHaveBeenCalledWith('p1');
    });

    it('does not call toast actions on Editar button click', async () => {
      const user = userEvent.setup();
      toastSpies.showSuccess.mockClear();
      toastSpies.showInfo.mockClear();
      mockOpenEditModal.mockClear();

      render(<PatientCard patient={createPatient({ id: 'p1' })} />);

      const editButton = screen.getByRole('button', { name: /editar/i });
      await user.click(editButton);

      expect(toastSpies.showSuccess).not.toHaveBeenCalled();
      expect(toastSpies.showInfo).not.toHaveBeenCalled();
      expect(mockOpenEditModal).toHaveBeenCalledWith('p1');
    });

    it('does not call toast actions on Ver más toggle click', async () => {
      const user = userEvent.setup();
      toastSpies.showSuccess.mockClear();
      toastSpies.showInfo.mockClear();

      render(
        <PatientCard
          patient={createPatient({ createdAt: '2024-01-15T10:00:00Z' })}
        />,
      );

      const toggleBtn = screen.getByRole('button', { name: /ver más/i });
      await user.click(toggleBtn);

      expect(toastSpies.showSuccess).not.toHaveBeenCalled();
      expect(toastSpies.showInfo).not.toHaveBeenCalled();
    });
  });
});
