import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { render, screen } from '@testing-library/react';
import { withZustandStore } from '../withZustandStore';

// ---------------------------------------------------------------------------
// Test store — simple Zustand store for decorator verification
// ---------------------------------------------------------------------------

interface CounterState {
  count: number;
  label: string;
}

interface CounterActions {
  increment(): void;
  reset(): void;
}

const useCounterStore = create<CounterState & CounterActions>()((set) => ({
  count: 0,
  label: 'default',
  increment: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0, label: 'default' }),
}));

// ---------------------------------------------------------------------------
// Second store — to test array of stores
// ---------------------------------------------------------------------------

interface ThemeState {
  mode: 'light' | 'dark';
}

const useThemeStore = create<ThemeState>()(() => ({
  mode: 'light',
}));

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
    return withZustandStore(() => <Story />, context as never);
  }

  return render(<Wrapper />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('withZustandStore decorator', () => {
  beforeEach(() => {
    useCounterStore.getState().reset();
    useThemeStore.setState({ mode: 'light' });
  });

  it('applies setState with the provided state before rendering', () => {
    function TestStory() {
      const count = useCounterStore((s) => s.count);
      const label = useCounterStore((s) => s.label);
      return (
        <div>
          <span data-testid="count">{count}</span>
          <span data-testid="label">{label}</span>
        </div>
      );
    }

    renderWithDecorator(TestStory, {
      zustandStore: {
        store: useCounterStore,
        state: { count: 42, label: 'injected' },
      },
    });

    expect(screen.getByTestId('count').textContent).toBe('42');
    expect(screen.getByTestId('label').textContent).toBe('injected');
  });

  it('restores the original state after unmounting', () => {
    // Set up initial store state
    useCounterStore.setState({ count: 10, label: 'original' });

    function TestStory() {
      const count = useCounterStore((s) => s.count);
      return <span data-testid="count">{count}</span>;
    }

    const { unmount } = renderWithDecorator(TestStory, {
      zustandStore: {
        store: useCounterStore,
        state: { count: 99 },
      },
    });

    // During render, state is overridden
    expect(screen.getByTestId('count').textContent).toBe('99');

    // After unmount, state should be restored
    unmount();
    expect(useCounterStore.getState().count).toBe(10);
    expect(useCounterStore.getState().label).toBe('original');
  });

  it('supports an array of stores', () => {
    function TestStory() {
      const count = useCounterStore((s) => s.count);
      const mode = useThemeStore((s) => s.mode);
      return (
        <div>
          <span data-testid="count">{count}</span>
          <span data-testid="mode">{mode}</span>
        </div>
      );
    }

    renderWithDecorator(TestStory, {
      zustandStore: [
        { store: useCounterStore, state: { count: 7 } },
        { store: useThemeStore, state: { mode: 'dark' } },
      ],
    });

    expect(screen.getByTestId('count').textContent).toBe('7');
    expect(screen.getByTestId('mode').textContent).toBe('dark');
  });

  it('renders the story normally when no zustandStore parameter is set', () => {
    useCounterStore.setState({ count: 5 });

    function TestStory() {
      const count = useCounterStore((s) => s.count);
      return <span data-testid="count">{count}</span>;
    }

    renderWithDecorator(TestStory, {});

    // Without the parameter, the store keeps its current state
    expect(screen.getByTestId('count').textContent).toBe('5');
  });
});
