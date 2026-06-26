import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FavoritesSection from './FavoritesSection';

describe('FavoritesSection', () => {
  it('renders an accessible section landmark with name "Favoritos"', () => {
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

  it('renders an empty state with inbox icon when there are no favorites', () => {
    render(<FavoritesSection />);

    // EmptyState title should be visible — descriptive message about no favorites
    expect(
      screen.getByText(/no tenés favoritos/i),
    ).toBeInTheDocument();

    // The inbox icon must be rendered inside the section with the correct SVG path
    const section = screen.getByRole('region', { name: /favoritos/i });
    const svg = section.querySelector('svg');
    expect(svg).toBeInTheDocument();

    const path = svg!.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path!.getAttribute('d')).toContain('M22 12h-6l-2 3');
  });

  it('remains visible even when empty', () => {
    render(<FavoritesSection />);

    const section = screen.getByRole('region', { name: /favoritos/i });
    expect(section).toBeInTheDocument();
  });

  it('applies optional className prop', () => {
    render(<FavoritesSection className="test-extra" />);

    const section = screen.getByRole('region', { name: 'Favoritos' });
    expect(section.className).toContain('test-extra');
  });
});
