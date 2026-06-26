import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Container from './Container';

describe('Container', () => {
  it('renders children inside the container', () => {
    render(
      <Container>
        <p>Hello world</p>
      </Container>,
    );

    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('applies max-width constraints', () => {
    render(
      <Container>
        <span>Content</span>
      </Container>,
    );

    const container = screen.getByText('Content').parentElement!;
    expect(container.className).toContain('max-w-7xl');
    expect(container.className).toContain('mx-auto');
  });

  it('applies responsive horizontal padding', () => {
    render(
      <Container>
        <span>Content</span>
      </Container>,
    );

    const container = screen.getByText('Content').parentElement!;
    expect(container.className).toContain('px-4');
    expect(container.className).toContain('sm:px-6');
    expect(container.className).toContain('lg:px-8');
  });

  it('merges additional className via cn() without losing base classes', () => {
    render(
      <Container className="bg-white py-6">
        <span>Content</span>
      </Container>,
    );

    const container = screen.getByText('Content').parentElement!;
    // Base classes must be preserved
    expect(container.className).toContain('max-w-7xl');
    expect(container.className).toContain('mx-auto');
    expect(container.className).toContain('px-4');
    // Extra classes must be present
    expect(container.className).toContain('bg-white');
    expect(container.className).toContain('py-6');
  });

  it('renders a div element by default', () => {
    render(
      <Container>
        <span>Content</span>
      </Container>,
    );

    const container = screen.getByText('Content').parentElement!;
    expect(container.tagName).toBe('DIV');
  });
});
