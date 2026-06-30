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

  it('displays the "Patient Records" title with accessible heading', () => {
    render(<Header />);

    const heading = screen.getByRole('heading', { name: /patient records/i });
    expect(heading).toBeInTheDocument();
  });


});
