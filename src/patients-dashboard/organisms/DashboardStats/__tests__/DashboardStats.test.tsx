import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardStats from '../DashboardStats';

// ---------------------------------------------------------------------------
// Store mocks
// ---------------------------------------------------------------------------

vi.mock('@/patients-dashboard/store/patients.store', () => ({
  usePatientsStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = {
      patients: [
        { id: '1', name: 'Ana', status: 'active' },
        { id: '2', name: 'Juan', status: 'inactive' },
        { id: '3', name: 'María', status: 'active' },
      ],
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
}));

vi.mock('@/patients-dashboard/store/favorites.store', () => ({
  useFavoritesStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = { favoritesCount: 2 };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
  selectFavoritesCount: (s: { favoritesCount: number }) => s.favoritesCount,
}));

// Mock useCountUp to return the target value immediately (no animation in tests)
vi.mock('../useCountUp', () => ({
  useCountUp: (target: number) => target,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardStats', () => {
  it('renders stats grid with responsive classes (grid-cols-1 sm:grid-cols-3)', () => {
    render(<DashboardStats />);
    const grid = screen.getByText('Total').parentElement?.parentElement;
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('sm:grid-cols-3');
  });

  it('renders Total, Activos, and Favoritos stats', () => {
    render(<DashboardStats />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Activos')).toBeInTheDocument();
    expect(screen.getByText('Favoritos')).toBeInTheDocument();
  });

  it('displays correct stat values', () => {
    render(<DashboardStats />);
    // 3 total patients, 2 active, 2 favorites
    const totalSection = screen.getByText('Total').parentElement;
    const activeSection = screen.getByText('Activos').parentElement;
    const favoritesSection = screen.getByText('Favoritos').parentElement;
    
    expect(totalSection).toHaveTextContent('3');
    expect(activeSection).toHaveTextContent('2');
    expect(favoritesSection).toHaveTextContent('2');
  });
});
