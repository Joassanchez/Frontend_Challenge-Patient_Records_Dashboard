import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders a <header> element', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header.tagName).toBe('HEADER');
  });

  it('exposes the banner landmark role', () => {
    render(<Header />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('is sticky with top-0 positioning', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('top-0');
  });

  it('has a bottom border separating header from content', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header.className).toContain('border-b');
  });

  it('displays the "Patient Records" title with accessible heading', () => {
    render(<Header />);

    const heading = screen.getByRole('heading', { name: /patient records/i });
    expect(heading).toBeInTheDocument();
  });

  it('title is styled as a heading with visual emphasis', () => {
    render(<Header />);

    const heading = screen.getByRole('heading', { name: /patient records/i });
    // Heading must have a text color class (not invisible/default)
    expect(heading.className).toMatch(/text-/);
  });

  it('has an appropriate z-index for stacking above content', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header.className).toContain('z-10');
  });
});
