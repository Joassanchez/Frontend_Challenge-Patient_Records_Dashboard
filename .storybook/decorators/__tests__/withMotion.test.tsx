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

  it('renders children normally when disableMotion is true', () => {
    function TestStory() {
      return <div data-testid="content">Static</div>;
    }

    renderWithDecorator(TestStory, { disableMotion: true });
    expect(screen.getByTestId('content').textContent).toBe('Static');
  });

  it('re-exports the story result without modification', () => {
    function TestStory() {
      return (
        <div>
          <span data-testid="a">A</span>
          <span data-testid="b">B</span>
        </div>
      );
    }

    renderWithDecorator(TestStory, {});
    expect(screen.getByTestId('a').textContent).toBe('A');
    expect(screen.getByTestId('b').textContent).toBe('B');
  });
});
