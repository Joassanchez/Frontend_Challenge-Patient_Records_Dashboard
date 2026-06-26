import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Icon from './Icon';

describe('Icon', () => {
  it('renders an SVG with aria-hidden by default', () => {
    const { container } = render(<Icon name="search" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('sets aria-label and removes aria-hidden when label prop is provided', () => {
    render(<Icon name="check" label="Done" />);
    const svg = screen.getByLabelText('Done');
    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('renders different SVG content per icon name', () => {
    const { container: c1 } = render(<Icon name="search" />);
    const { container: c2 } = render(<Icon name="close" />);
    const svg1 = c1.querySelector('svg')!;
    const svg2 = c2.querySelector('svg')!;
    // Different icon names should produce different SVG paths
    expect(svg1.innerHTML).not.toEqual(svg2.innerHTML);
  });

  it('defaults to md size (20px)', () => {
    const { container } = render(<Icon name="inbox" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('20');
    expect(svg.getAttribute('height')).toBe('20');
  });

  it('applies sm size (16px)', () => {
    const { container } = render(<Icon name="user" size="sm" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('16');
    expect(svg.getAttribute('height')).toBe('16');
  });

  it('applies lg size (24px)', () => {
    const { container } = render(<Icon name="alert-circle" size="lg" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
  });

  describe('plus icon', () => {
    it('renders plus icon SVG with a non-empty path and aria-hidden by default', () => {
      const { container } = render(<Icon name="plus" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');

      const path = svg!.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path!.getAttribute('d')).toBeTruthy();
      expect(path!.getAttribute('d')!.length).toBeGreaterThan(0);
    });

    it('plus icon with label sets aria-label and removes aria-hidden', () => {
      render(<Icon name="plus" label="Add" />);
      const svg = screen.getByLabelText('Add');
      expect(svg).toBeInTheDocument();
      expect(svg).not.toHaveAttribute('aria-hidden');
    });

    it('plus icon path differs from other icons', () => {
      const { container: c1 } = render(<Icon name="plus" />);
      const { container: c2 } = render(<Icon name="close" />);
      const path1 = c1.querySelector('path')!;
      const path2 = c2.querySelector('path')!;
      expect(path1.getAttribute('d')).not.toEqual(path2.getAttribute('d'));
    });
  });

  describe('new action icons (eye, edit, heart)', () => {
    it.each(['eye', 'edit', 'heart'] as const)('renders %s icon with a non-empty path', (name) => {
      const { container } = render(<Icon name={name} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();

      const path = svg!.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path!.getAttribute('d')).toBeTruthy();
      expect(path!.getAttribute('d')!.length).toBeGreaterThan(0);
    });

    it.each(['eye', 'edit', 'heart'] as const)('%s icon defaults to aria-hidden', (name) => {
      const { container } = render(<Icon name={name} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it.each(['eye', 'edit', 'heart'] as const)('%s icon with label sets aria-label', (name) => {
      render(<Icon name={name} label={`Label for ${name}`} />);
      expect(screen.getByLabelText(`Label for ${name}`)).toBeInTheDocument();
    });

    it('all three new icons have different paths from each other', () => {
      const { container: c1 } = render(<Icon name="eye" />);
      const { container: c2 } = render(<Icon name="edit" />);
      const { container: c3 } = render(<Icon name="heart" />);
      const d1 = c1.querySelector('path')!.getAttribute('d')!;
      const d2 = c2.querySelector('path')!.getAttribute('d')!;
      const d3 = c3.querySelector('path')!.getAttribute('d')!;
      expect(d1).not.toEqual(d2);
      expect(d2).not.toEqual(d3);
      expect(d1).not.toEqual(d3);
    });
  });
});
