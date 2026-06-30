import type { Mock } from 'vitest';
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToastStoreMockOptions {
  getState?: () => { toasts: unknown[] };
  actions?: Partial<
    Record<
      'showSuccess' | 'showError' | 'showInfo' | 'showWarning' |
      'dismissToast' | 'clearToasts' | 'resetStore',
      Mock
    >
  >;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createToastStoreMock(options?: ToastStoreMockOptions) {
  return {
    useToastStore: vi.fn((selector?: (state: { toasts: unknown[] }) => unknown) => {
      const state = options?.getState ? options.getState() : { toasts: [] };
      if (selector) return selector(state);
      return {
        ...state,
        showSuccess: options?.actions?.showSuccess ?? vi.fn(),
        showError: options?.actions?.showError ?? vi.fn(),
        showInfo: options?.actions?.showInfo ?? vi.fn(),
        showWarning: options?.actions?.showWarning ?? vi.fn(),
        dismissToast: options?.actions?.dismissToast ?? vi.fn(),
        clearToasts: options?.actions?.clearToasts ?? vi.fn(),
        resetStore: options?.actions?.resetStore ?? vi.fn(),
      };
    }),
    selectToasts: (state: { toasts: unknown[] }) => state.toasts,
  };
}
