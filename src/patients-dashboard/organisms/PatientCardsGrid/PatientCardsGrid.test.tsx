import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientCardsGrid from '@/patients-dashboard/organisms/PatientCardsGrid';
import { createPatient } from '../../../../test/fixtures/patient.fixture';

// ---------------------------------------------------------------------------
// Mocks de stores usados por PatientCard
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

vi.mock('@/patients-dashboard/store/favorites.store', () => ({
  useFavoritesStore: vi.fn((selector?: (state: unknown) => unknown) => {
    const state = { favoritePatientIds: [], toggleFavorite: mockToggleFavorite };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
  selectIsFavorite: () => () => false,
}));

vi.mock('@/patients-dashboard/store/modal.store', () => ({
  useModalStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = {
      isOpen: false,
      mode: 'create' as const,
      selectedPatientId: null,
      openEditModal: vi.fn(),
      closeModal: vi.fn(),
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PatientCardsGrid', () => {
  it('renderiza 6 SkeletonCard cuando isLoading es true (default)', () => {
    const { container } = render(
      <PatientCardsGrid patients={[]} isLoading={true} />,
    );
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBe(6);
  });

  it('no renderiza PatientCard cuando isLoading es true', () => {
    render(<PatientCardsGrid patients={[]} isLoading={true} />);
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument();
  });

  it('renderiza PatientCard cuando isLoading es false y hay pacientes', () => {
    const patients = [
      createPatient({ id: '1', name: 'Patient One' }),
      createPatient({ id: '2', name: 'Patient Two' }),
    ];
    render(<PatientCardsGrid patients={patients} isLoading={false} />);
    expect(screen.getByText('Patient One')).toBeInTheDocument();
    expect(screen.getByText('Patient Two')).toBeInTheDocument();
  });

  it('no renderiza skeletons cuando isLoading es false', () => {
    const patients = [createPatient()];
    const { container } = render(
      <PatientCardsGrid patients={patients} isLoading={false} />,
    );
    const skeletons = container.querySelectorAll('[class*="shimmer"]');
    expect(skeletons.length).toBe(0);
  });

  it('isLoading es false por defecto cuando la prop se omite', () => {
    const patients = [createPatient({ name: 'Default Patient' })];
    render(<PatientCardsGrid patients={patients} />);
    expect(screen.getByText('Default Patient')).toBeInTheDocument();
  });

  it('reemplaza skeletons por cards cuando llegan los datos', () => {
    const { rerender, container } = render(
      <PatientCardsGrid patients={[]} isLoading={true} />,
    );
    // 6 skeleton cards rendered
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(6);

    rerender(
      <PatientCardsGrid
        patients={[createPatient({ name: 'Loaded Patient' })]}
        isLoading={false}
      />,
    );
    // No more skeleton cards (skeletons have aria-hidden, cards don't)
    // Note: motion.div may add some aria-hidden, so we check skeletons are gone
    expect(screen.getByText('Loaded Patient')).toBeInTheDocument();
    // Skeleton count should be 0 (no SkeletonCard rendered)
    const skeletonCards = container.querySelectorAll('.animate-\\[shimmer');
    expect(skeletonCards.length).toBe(0);
  });
});
