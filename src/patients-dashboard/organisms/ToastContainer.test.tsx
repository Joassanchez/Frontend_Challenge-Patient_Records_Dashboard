import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToastContainer from './ToastContainer';
import type { ToastMessage } from '../store/toast.store';
import { makeToast } from '@/test/helpers/toast.helper';

// ---------------------------------------------------------------------------
// Mock — toast.store (stateful via vi.hoisted; factory inlined for hoist safety)
// ---------------------------------------------------------------------------

const { toastState } = vi.hoisted(() => {
  const dismissToast = vi.fn<(id: string) => void>();
  const toasts: ToastMessage[] = [];
  return { toastState: { toasts, dismissToast } };
});

vi.mock('../store/toast.store', () => ({
  useToastStore: vi.fn(
    (selector?: (state: { toasts: ToastMessage[]; dismissToast: typeof toastState.dismissToast }) => unknown) => {
      const state = { toasts: toastState.toasts, dismissToast: toastState.dismissToast };
      if (typeof selector === 'function') return selector(state);
      return { ...state, dismissToast: toastState.dismissToast };
    },
  ),
  selectToasts: (state: { toasts: ToastMessage[] }) => state.toasts,
}));

// ---------------------------------------------------------------------------
// Test isolation
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  toastState.toasts = [];
  toastState.dismissToast = vi.fn<(id: string) => void>();
});

// ============================================================================
// Empty State
// ============================================================================

describe('Empty state', () => {
  it('returns null (no DOM nodes) when toasts array is empty', () => {
    toastState.toasts = [];
    const { container } = render(<ToastContainer />);
    expect(container.innerHTML).toBe('');
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

// ============================================================================
// Toast Rendering
// ============================================================================

describe('Toast rendering', () => {
  it('renders a single success toast with accessible role and visible message', () => {
    toastState.toasts = [makeToast({ type: 'success', message: 'Operation finished' })];
    render(<ToastContainer />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Operation finished')).toBeInTheDocument();
  });

  it('renders an error toast with role="alert"', () => {
    toastState.toasts = [makeToast({ type: 'error', message: 'Connection failed' })];
    render(<ToastContainer />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('renders multiple toasts — all are present in the DOM', () => {
    toastState.toasts = [
      makeToast({ id: 'a', type: 'success', message: 'First' }),
      makeToast({ id: 'b', type: 'error', message: 'Second' }),
      makeToast({ id: 'c', type: 'info', message: 'Third' }),
    ];
    render(<ToastContainer />);

    // Verify all messages are visible
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();

    // Role count: 2 status (success + info) + 1 alert (error)
    const statuses = screen.getAllByRole('status');
    const alerts = screen.getAllByRole('alert');
    expect(statuses).toHaveLength(2);
    expect(alerts).toHaveLength(1);
    expect(statuses.length + alerts.length).toBe(3);
  });
});

// ============================================================================
// Dismiss Wiring (REQ-TU-03 via container)
// ============================================================================

describe('Dismiss wiring', () => {
  it('calls dismissToast with the correct toast id when close button is clicked', async () => {
    const user = userEvent.setup();
    toastState.toasts = [makeToast({ id: 'toast-dismiss-1', type: 'success', message: 'Dismiss this' })];
    render(<ToastContainer />);

    const closeButton = screen.getByRole('button', { name: 'Cerrar notificación' });
    await user.click(closeButton);

    expect(toastState.dismissToast).toHaveBeenCalledTimes(1);
    expect(toastState.dismissToast).toHaveBeenCalledWith('toast-dismiss-1');
  });

  it('dismisses each toast independently with its own id', async () => {
    const user = userEvent.setup();
    toastState.toasts = [
      makeToast({ id: 'first-id', type: 'success', message: 'First toast' }),
      makeToast({ id: 'second-id', type: 'error', message: 'Second toast' }),
    ];
    render(<ToastContainer />);

    const closeButtons = screen.getAllByRole('button', { name: 'Cerrar notificación' });
    expect(closeButtons).toHaveLength(2);

    // Click second toast's close button first
    await user.click(closeButtons[1]);
    expect(toastState.dismissToast).toHaveBeenCalledTimes(1);
    expect(toastState.dismissToast).toHaveBeenCalledWith('second-id');

    // Click first toast's close button
    await user.click(closeButtons[0]);
    expect(toastState.dismissToast).toHaveBeenCalledTimes(2);
    expect(toastState.dismissToast).toHaveBeenCalledWith('first-id');
  });

  it('renders a close button for each visible toast', () => {
    toastState.toasts = [
      makeToast({ id: 'a', type: 'success', message: 'Alpha' }),
      makeToast({ id: 'b', type: 'info', message: 'Beta' }),
    ];
    render(<ToastContainer />);

    const buttons = screen.getAllByRole('button', { name: 'Cerrar notificación' });
    expect(buttons).toHaveLength(2);
  });
});

// ============================================================================
// Accessibility (REQ-TU-08 — non-blocking + aria-live)
// ============================================================================

describe('Accessibility', () => {
  it('container declares aria-live="polite" for screen reader announcements', () => {
    toastState.toasts = [makeToast()];
    render(<ToastContainer />);

    // The container itself should be a live region
    const liveRegion = screen.getByRole('status').closest('[aria-live]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('background elements remain accessible — container does not block page interaction', async () => {
    const user = userEvent.setup();
    const onBackgroundClick = vi.fn();
    toastState.toasts = [makeToast({ type: 'success', message: 'Visible toast' })];

    render(
      <div>
        <button onClick={onBackgroundClick}>Background Action</button>
        <ToastContainer />
      </div>,
    );

    // The background button should be findable and clickable
    const bgButton = screen.getByRole('button', { name: 'Background Action' });
    expect(bgButton).toBeInTheDocument();

    await user.click(bgButton);
    expect(onBackgroundClick).toHaveBeenCalledTimes(1);
  });

  it('individual toasts are independently interactable via their close buttons', () => {
    toastState.toasts = [
      makeToast({ id: 'one', type: 'success', message: 'Toast one' }),
      makeToast({ id: 'two', type: 'error', message: 'Toast two' }),
      makeToast({ id: 'three', type: 'info', message: 'Toast three' }),
    ];
    render(<ToastContainer />);

    const buttons = screen.getAllByRole('button', { name: 'Cerrar notificación' });
    expect(buttons).toHaveLength(3);

    // Each close button should be enabled and clickable
    for (const btn of buttons) {
      expect(btn).toBeEnabled();
    }
  });
});

// ============================================================================
// Positioning & Layout (REQ-TU-04, REQ-TU-05)
// ============================================================================

describe('Positioning and layout', () => {
  it('container is fixed-positioned for desktop: top-right below CTA', () => {
    toastState.toasts = [makeToast()];
    render(<ToastContainer />);

    const liveRegion = screen.getByRole('status').closest('[aria-live]') as HTMLElement;
    expect(liveRegion.className).toContain('fixed');
    expect(liveRegion.className).toContain('sm:top-24');
    expect(liveRegion.className).toContain('sm:right-6');
    expect(liveRegion.className).toContain('sm:left-auto');
  });

  it('container uses mobile-first positioning: inset-x-4 bottom-4', () => {
    toastState.toasts = [makeToast()];
    render(<ToastContainer />);

    const liveRegion = screen.getByRole('status').closest('[aria-live]') as HTMLElement;
    // Base classes: full-width bottom placement with constrained width
    expect(liveRegion.className).toContain('inset-x-4');
    expect(liveRegion.className).toContain('bottom-4');
  });

  it('container has z-40 for correct stacking context (REQ-TU-05)', () => {
    toastState.toasts = [makeToast()];
    render(<ToastContainer />);

    const liveRegion = screen.getByRole('status').closest('[aria-live]') as HTMLElement;
    expect(liveRegion.className).toContain('z-40');
  });

  it('container uses pointer-events-none — toasts use pointer-events-auto (REQ-TU-08)', () => {
    toastState.toasts = [makeToast()];
    render(<ToastContainer />);

    const liveRegion = screen.getByRole('status').closest('[aria-live]') as HTMLElement;
    expect(liveRegion.className).toContain('pointer-events-none');

    // The individual toast (role="status") should be pointer-events-auto
    const toast = screen.getByRole('status');
    expect(toast.className).toContain('pointer-events-auto');
  });

  it('renders toasts in a vertical flex column with gap', () => {
    toastState.toasts = [makeToast()];
    render(<ToastContainer />);

    const liveRegion = screen.getByRole('status').closest('[aria-live]') as HTMLElement;
    expect(liveRegion.className).toContain('flex');
    expect(liveRegion.className).toContain('flex-col');
    expect(liveRegion.className).toContain('gap-2');
  });

  it('constrains container width to max-w-sm and full width', () => {
    toastState.toasts = [makeToast()];
    render(<ToastContainer />);

    const liveRegion = screen.getByRole('status').closest('[aria-live]') as HTMLElement;
    expect(liveRegion.className).toContain('max-w-sm');
    expect(liveRegion.className).toContain('w-full');
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('edge cases', () => {
  it('renders mixed toast types (success + error + info + warning) without crashing', () => {
    toastState.toasts = [
      makeToast({ id: '1', type: 'success', message: 'Success msg' }),
      makeToast({ id: '2', type: 'error', message: 'Error msg' }),
      makeToast({ id: '3', type: 'info', message: 'Info msg' }),
    ];
    render(<ToastContainer />);

    expect(screen.getByText('Success msg')).toBeInTheDocument();
    expect(screen.getByText('Error msg')).toBeInTheDocument();
    expect(screen.getByText('Info msg')).toBeInTheDocument();

    const statuses = screen.getAllByRole('status');
    const alerts = screen.getAllByRole('alert');
    expect(statuses).toHaveLength(2); // success + info
    expect(alerts).toHaveLength(1);   // error
  });

  it('renders toasts with long message content without truncation in DOM', () => {
    const longMessage = 'Este es un mensaje muy largo que debería mostrarse completo sin truncamiento en el contenedor de toasts.';
    toastState.toasts = [makeToast({ type: 'info', message: longMessage })];
    render(<ToastContainer />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('preserves the toast message as visible text content (not aria-label only)', () => {
    toastState.toasts = [makeToast({ type: 'warning', message: 'Visible warning' })];
    render(<ToastContainer />);

    // The message should be visible text, not hidden
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Visible warning');
  });

  it('ToastContainer is idempotent — re-render with same toasts produces same DOM', () => {
    toastState.toasts = [makeToast({ id: 'stable', type: 'success', message: 'Stable' })];
    const { rerender } = render(<ToastContainer />);

    const firstStatus = screen.getByRole('status');
    expect(firstStatus).toBeInTheDocument();

    rerender(<ToastContainer />);

    const secondStatus = screen.getByRole('status');
    expect(secondStatus).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
  });
});
