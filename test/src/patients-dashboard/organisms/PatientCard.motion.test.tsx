import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientCard from '@/patients-dashboard/organisms/PatientCard';
import { createPatient } from '@test/fixtures/patient.fixture';

// ---------------------------------------------------------------------------
// Mocks de stores
// ---------------------------------------------------------------------------

vi.mock('@/patients-dashboard/store/toast.store', () => ({
  useToastStore: vi.fn((selector?: (state: unknown) => unknown) => {
    const state = {
      toasts: [],
      showSuccess: vi.fn(),
      showInfo: vi.fn(),
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

const mockToggleFavorite = vi.fn<(id: string) => boolean>().mockReturnValue(true);
let favoritesStoreState = { favoritePatientIds: [] as string[], toggleFavorite: mockToggleFavorite };

vi.mock('@/patients-dashboard/store/favorites.store', () => ({
  useFavoritesStore: vi.fn((selector?: (state: unknown) => unknown) => {
    if (typeof selector === 'function') return selector(favoritesStoreState);
    return favoritesStoreState;
  }),
  selectIsFavorite: (id: string) => (state: typeof favoritesStoreState) =>
    state.favoritePatientIds.includes(id),
}));

const mockOpenEditModal = vi.fn();
vi.mock('@/patients-dashboard/store/modal.store', () => ({
  useModalStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = {
      isOpen: false,
      mode: 'create' as const,
      selectedPatientId: null,
      openEditModal: mockOpenEditModal,
      closeModal: vi.fn(),
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
}));

// ---------------------------------------------------------------------------
// Animación de favorito (FT-01, FT-02)
// ---------------------------------------------------------------------------

describe('Bounce del botón favorito', () => {
  it('envuelve el botón favorito y se renderiza correctamente', () => {
    favoritesStoreState = { favoritePatientIds: [], toggleFavorite: mockToggleFavorite };
    render(<PatientCard patient={createPatient({ id: 'p1' })} />);
    const favButton = screen.getByRole('button', { name: /agregar.*favoritos/i });
    expect(favButton).toBeInTheDocument();
  });

  it('llama a toggleFavorite en cada click (ambas direcciones)', async () => {
    const user = userEvent.setup();
    favoritesStoreState = { favoritePatientIds: [], toggleFavorite: mockToggleFavorite };
    mockToggleFavorite.mockClear();

    render(<PatientCard patient={createPatient({ id: 'p1' })} />);

    const favButton = screen.getByRole('button', { name: /agregar.*favoritos/i });
    await user.click(favButton);
    expect(mockToggleFavorite).toHaveBeenCalledWith('p1');
  });
});

// ---------------------------------------------------------------------------
// Panel expandible (ED-01, ED-02)
// ---------------------------------------------------------------------------

describe('Animación del panel expandible', () => {
  it('aria-expanded refleja el estado actual', async () => {
    const user = userEvent.setup();
    render(
      <PatientCard patient={createPatient({ createdAt: '2024-01-15T10:00:00Z' })} />,
    );

    const toggle = screen.getByRole('button', { name: /ver más/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('el contenido del panel es accesible al expandir', async () => {
    const user = userEvent.setup();
    render(
      <PatientCard patient={createPatient({ createdAt: '2024-01-15T10:00:00Z' })} />,
    );

    const toggle = screen.getByRole('button', { name: /ver más/i });
    await user.click(toggle);

    expect(screen.getByText(/fecha de registro/i)).toBeInTheDocument();
  });
});
