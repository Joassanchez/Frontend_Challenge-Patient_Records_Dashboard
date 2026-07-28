import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

// ---------------------------------------------------------------------------
// Theme mock
// ---------------------------------------------------------------------------

let currentTheme: 'light' | 'dark' = 'light';
const mockToggleTheme = vi.fn();

vi.mock('@/shared/theme/useTheme', () => ({
  useTheme: () => ({
    theme: currentTheme,
    toggleTheme: mockToggleTheme,
  }),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Header', () => {
  it('renders the header with title', () => {
    render(<Header />);
    expect(screen.getByText('Registros de pacientes')).toBeInTheDocument();
  });

  it('shows "Modo oscuro" label when theme is light', () => {
    currentTheme = 'light';
    render(<Header />);
    expect(screen.getByText('Modo oscuro')).toBeInTheDocument();
  });

  it('shows "Modo claro" label when theme is dark', () => {
    currentTheme = 'dark';
    render(<Header />);
    expect(screen.getByText('Modo claro')).toBeInTheDocument();
  });

  it('label is hidden on mobile (hidden sm:inline)', () => {
    currentTheme = 'light';
    render(<Header />);
    const label = screen.getByText('Modo oscuro');
    expect(label).toHaveClass('hidden');
    expect(label).toHaveClass('sm:inline');
  });

  it('button has correct aria-label', () => {
    currentTheme = 'light';
    render(<Header />);
    const button = screen.getByRole('button', { name: /modo oscuro/i });
    expect(button).toBeInTheDocument();
  });
});
