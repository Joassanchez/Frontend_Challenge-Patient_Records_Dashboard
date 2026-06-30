import { describe, it, expect, vi } from 'vitest';

// RED: import from file that doesn't exist yet
import { createToastStoreMock } from './toast-store.mock';

describe('createToastStoreMock', () => {
  // ===========================================================================
  // Noop Mode — Scenario: Noop mode provides empty state
  // ===========================================================================
  describe('noop mode (default)', () => {
    it('returns an object with useToastStore as a mock function', () => {
      const mock = createToastStoreMock();

      expect(mock.useToastStore).toBeDefined();
      expect(vi.isMockFunction(mock.useToastStore)).toBe(true);
    });

    it('useToastStore() without selector returns full store shape with empty toasts', () => {
      const mock = createToastStoreMock();
      const state = mock.useToastStore();

      expect(state).toBeDefined();
      expect(state).toHaveProperty('toasts');
      expect(state.toasts).toEqual([]);
    });

    it('useToastStore() without selector returns action properties that are mock functions', () => {
      const mock = createToastStoreMock();
      const state = mock.useToastStore();

      expect(vi.isMockFunction(state.showSuccess)).toBe(true);
      expect(vi.isMockFunction(state.showError)).toBe(true);
      expect(vi.isMockFunction(state.showInfo)).toBe(true);
      expect(vi.isMockFunction(state.showWarning)).toBe(true);
      expect(vi.isMockFunction(state.dismissToast)).toBe(true);
      expect(vi.isMockFunction(state.clearToasts)).toBe(true);
      expect(vi.isMockFunction(state.resetStore)).toBe(true);
    });

    // Scenario: Noop mode supports selector pattern
    it('useToastStore(selector) passes state to selector and returns selector result', () => {
      const mock = createToastStoreMock();
      const selector = vi.fn((state: { toasts: unknown[] }) => state.toasts);

      const result = mock.useToastStore(selector);

      expect(selector).toHaveBeenCalledTimes(1);
      // Selector receives { toasts: [] }
      expect(selector).toHaveBeenCalledWith(
        expect.objectContaining({ toasts: [] }),
      );
      // Returns selector result (toasts array)
      expect(result).toEqual([]);
    });

    it('calling createToastStoreMock() returns a fresh mock each time (no shared state)', () => {
      const mock1 = createToastStoreMock();
      const mock2 = createToastStoreMock();

      // Each call produces a new useToastStore mock function
      expect(mock1.useToastStore).not.toBe(mock2.useToastStore);

      const state1 = mock1.useToastStore();
      const state2 = mock2.useToastStore();

      // Action spies are independently created
      expect(state1.showSuccess).not.toBe(state2.showSuccess);
    });
  });

  // ===========================================================================
  // Stateful Mode — Scenario: getState provides custom state
  // ===========================================================================
  describe('stateful mode (getState option)', () => {
    it('getState provides custom toast state via useToastStore()', () => {
      const mock = createToastStoreMock({
        getState: () => ({
          toasts: [
            { id: 't1', type: 'success' as const, message: 'Stateful toast', createdAt: 1000 },
          ],
        }),
      });

      const state = mock.useToastStore();

      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]).toMatchObject({ id: 't1', message: 'Stateful toast' });
    });

    it('getState toasts are passed to selector', () => {
      const customToasts = [
        { id: 'a', type: 'error' as const, message: 'Err', createdAt: 2000 },
        { id: 'b', type: 'info' as const, message: 'Info', createdAt: 3000 },
      ];
      const mock = createToastStoreMock({
        getState: () => ({ toasts: customToasts }),
      });

      const selector = (s: { toasts: unknown[] }) => s.toasts;
      const result = mock.useToastStore(selector);

      expect(result).toBe(customToasts);
      expect(result).toHaveLength(2);
    });
  });

  // ===========================================================================
  // Actions Option — Scenario: custom action spies
  // ===========================================================================
  describe('actions option', () => {
    it('accepts custom action spies via actions option', () => {
      const customShowSuccess = vi.fn();
      const customDismissToast = vi.fn();

      const mock = createToastStoreMock({
        actions: {
          showSuccess: customShowSuccess,
          dismissToast: customDismissToast,
        },
      });

      const state = mock.useToastStore();

      // Custom spies are used for specified actions
      expect(state.showSuccess).toBe(customShowSuccess);
      expect(state.dismissToast).toBe(customDismissToast);

      // Unspecified actions still get default mocks
      expect(vi.isMockFunction(state.showError)).toBe(true);
      expect(vi.isMockFunction(state.clearToasts)).toBe(true);
    });

    it('action spy can be asserted on after being called', () => {
      const customShowSuccess = vi.fn();
      const mock = createToastStoreMock({
        actions: { showSuccess: customShowSuccess },
      });

      const state = mock.useToastStore();
      state.showSuccess('Test message', 5000);

      expect(customShowSuccess).toHaveBeenCalledWith('Test message', 5000);
    });
  });

  // ===========================================================================
  // selectToasts export — needed by components that import it directly
  // ===========================================================================
  describe('selectToasts export', () => {
    it('selectToasts is a function that returns state.toasts', () => {
      const mock = createToastStoreMock();

      expect(mock.selectToasts).toBeDefined();
      expect(typeof mock.selectToasts).toBe('function');

      const result = mock.selectToasts({ toasts: [{ id: 't1' }] });
      expect(result).toEqual([{ id: 't1' }]);
    });
  });

  // ===========================================================================
  // Hoisting Safety — Scenario: Mock works when vi.mock is hoisted
  // ===========================================================================
  describe('hoisting safety', () => {
    it('factory does not reference external module-scope variables (self-contained)', () => {
      // The factory is called with options directly. If it relied on external
      // module-scope variables, this test would fail because no such var exists.
      const mock = createToastStoreMock({
        getState: () => ({ toasts: [] }),
        actions: { showSuccess: vi.fn() },
      });

      const state = mock.useToastStore();
      expect(state.toasts).toEqual([]);
      expect(vi.isMockFunction(state.showSuccess)).toBe(true);
    });

    it('factory works when called with no options (pure noop)', () => {
      // Simulates vi.mock hoisting: the factory must work with zero args
      const mock = createToastStoreMock();
      const state = mock.useToastStore();
      expect(state.toasts).toEqual([]);
    });

    it('multiple calls with different options do not interfere', () => {
      const noop = createToastStoreMock();
      const stateful = createToastStoreMock({
        getState: () => ({
          toasts: [{ id: 'x', type: 'warning' as const, message: 'Warn', createdAt: 1 }],
        }),
      });

      expect(noop.useToastStore().toasts).toEqual([]);
      expect(stateful.useToastStore().toasts).toHaveLength(1);
    });
  });
});
