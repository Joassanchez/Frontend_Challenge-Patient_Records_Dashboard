import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SkeletonCard from '@/patients-dashboard/atoms/SkeletonCard';

describe('SkeletonCard', () => {
  it('tiene aria-hidden="true" (placeholder decorativo)', () => {
    const { container } = render(<SkeletonCard />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  it('renderiza 3 barras placeholder (excluyendo el overlay shimmer)', () => {
    const { container } = render(<SkeletonCard />);
    const root = container.firstElementChild as HTMLElement;
    const allChildren = root.querySelectorAll(':scope > div');
    // Filtra el overlay shimmer (position:absolute)
    const bars = Array.from(allChildren).filter(
      (el) => !(el as HTMLElement).className.includes('animate-[shimmer'),
    );
    expect(bars).toHaveLength(3);
  });

  it('aplica la clase de animación shimmer', () => {
    const { container } = render(<SkeletonCard />);
    const root = container.firstElementChild as HTMLElement;
    const shimmerLayer = root.querySelector('[class*="shimmer"]') as HTMLElement;
    expect(shimmerLayer).toBeTruthy();
    expect(shimmerLayer.className).toContain('animate-[shimmer_1.5s_infinite]');
  });

  it('aplica motion-reduce:animate-none para accesibilidad', () => {
    const { container } = render(<SkeletonCard />);
    const root = container.firstElementChild as HTMLElement;
    const shimmerLayer = root.querySelector('[class*="shimmer"]') as HTMLElement;
    expect(shimmerLayer.className).toContain('motion-reduce:animate-none');
  });

  it('acepta className para estilos externos', () => {
    const { container } = render(<SkeletonCard className="custom-class" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('custom-class');
  });
});
