import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { withMotion } from '../withMotion';

// ---------------------------------------------------------------------------
// Helper to render a story through the decorator
// ---------------------------------------------------------------------------

function renderWithDecorator(
  Story: React.ComponentType,
  parameters: Record<string, unknown> = {},
) {
  const context = {
    parameters,
    id: 'test',
    kind: 'test',
    name: 'test',
    storyFn: () => null,
    args: {},
    argTypes: {},
    viewMode: 'story' as const,
    loaded: {},
    globals: {},
    initialArgs: {},
  };

  function Wrapper() {
    return withMotion(() => <Story />, context as never);
  }

  return render(<Wrapper />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('withMotion decorator', () => {
  it('renders children normally when disableMotion is not set', () => {
    function TestStory() {
      return <div data-testid="content">Hello</div>;
    }

    renderWithDecorator(TestStory, {});
    expect(screen.getByTestId('content').textContent).toBe('Hello');
  });

  it('renders children normally when disableMotion is false', () => {
    function TestStory() {
      return <div data-testid="content">Animated</div>;
    }

    renderWithDecorator(TestStory, { disableMotion: false });
    expect(screen.getByTestId('content').textContent).toBe('Animated');
  });

  it('wraps content in sb-disable-motion container when disableMotion is true', () => {
    function TestStory() {
      return <div data-testid="content">Static</div>;
    }

    const { container } = renderWithDecorator(TestStory, { disableMotion: true });

    // El wrapper debe tener la clase sb-disable-motion
    const wrapper = container.querySelector('.sb-disable-motion');
    expect(wrapper).toBeTruthy();

    // El contenido debe seguir renderizándose correctamente
    expect(screen.getByTestId('content').textContent).toBe('Static');
  });

  it('injects a <style> tag that cancels animations when disableMotion is true', () => {
    function TestStory() {
      return <div data-testid="content">Frozen</div>;
    }

    const { container } = renderWithDecorator(TestStory, { disableMotion: true });

    // Verificar que el <style> fue inyectado
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeTruthy();
    expect(styleTag!.textContent).toContain('animation-duration: 0s');
    expect(styleTag!.textContent).toContain('transition-duration: 0s');
    expect(styleTag!.textContent).toContain('sb-disable-motion');
  });

  it('does not inject style or wrapper when disableMotion is false', () => {
    function TestStory() {
      return <div data-testid="content">Normal</div>;
    }

    const { container } = renderWithDecorator(TestStory, { disableMotion: false });

    // Sin wrapper sb-disable-motion
    expect(container.querySelector('.sb-disable-motion')).toBeNull();
    // Sin style tag
    expect(container.querySelector('style')).toBeNull();
  });
});
