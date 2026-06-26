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

  it('has a translucent background with blur and solid fallback', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header.className).toContain('bg-white');
    expect(header.className).toContain('bg-white/80');
    expect(header.className).toContain('backdrop-blur-sm');
  });

  it('has a bottom border', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header.className).toContain('border-b');
    expect(header.className).toContain('border-slate-200');
  });

  it('displays the "Patient Records" title with accessible heading', () => {
    render(<Header />);

    const heading = screen.getByRole('heading', { name: /patient records/i });
    expect(heading).toBeInTheDocument();
  });

  it('title has sufficient contrast (text-slate-900 over white background)', () => {
    render(<Header />);

    const heading = screen.getByRole('heading', { name: /patient records/i });
    // text-slate-900 (#0f172a) on white/semi-transparent white passes WCAG AA
    expect(heading.className).toContain('text-slate-900');
  });

  it('has an appropriate z-index for stacking above content', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header.className).toContain('z-10');
  });
});
