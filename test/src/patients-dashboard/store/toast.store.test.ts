import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import {
  useToastStore,
  selectToasts,
} from '@/patients-dashboard/store/toast.store';

// ---------------------------------------------------------------------------
// Timer isolation — required for deterministic auto-dismiss tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  useToastStore.getState().resetStore();
});

afterAll(() => {
  vi.useRealTimers();
});

// ============================================================================
// REQ-TS-01: Toast State Shape
// ============================================================================
describe('REQ-TS-01: Toast State Shape', () => {
  it('initial state has an empty toasts array', () => {
    const state = useToastStore.getState();
    expect(state.toasts).toEqual([]);
  });

  it('selectToasts returns the toasts array from state', () => {
    const state = useToastStore.getState();
    expect(selectToasts(state)).toEqual([]);
  });


});

// ============================================================================
// REQ-TS-02: Add Toast
// ============================================================================
describe('REQ-TS-02: Add Toast', () => {
  it('showToast appends a toast to the queue with generated id, type, message, and createdAt', () => {
    const { showToast } = useToastStore.getState();
    showToast({ type: 'success', message: 'Paciente creado correctamente' });

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Paciente creado correctamente');
    expect(typeof toasts[0].id).toBe('string');
    expect(toasts[0].id.length).toBeGreaterThan(0);
    expect(typeof toasts[0].createdAt).toBe('number');
    expect(toasts[0].createdAt).toBeGreaterThan(0);
  });

  it('showToast generates unique ids for consecutive calls', () => {
    const { showToast } = useToastStore.getState();
    showToast({ type: 'info', message: 'First' });
    showToast({ type: 'info', message: 'Second' });

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(2);
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it('duplicate messages at different times each get unique IDs', () => {
    const { showToast } = useToastStore.getState();
    showToast({ type: 'info', message: 'Same message' });
    showToast({ type: 'info', message: 'Same message' });

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(2);
    expect(toasts[0].message).toBe('Same message');
    expect(toasts[1].message).toBe('Same message');
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it('showSuccess convenience method adds a success toast', () => {
    const { showSuccess } = useToastStore.getState();
    showSuccess('Operación exitosa');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Operación exitosa');
  });

  it('showError convenience method adds an error toast', () => {
    const { showError } = useToastStore.getState();
    showError('Algo salió mal');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('error');
    expect(toasts[0].message).toBe('Algo salió mal');
  });

  it('showInfo convenience method adds an info toast', () => {
    const { showInfo } = useToastStore.getState();
    showInfo('Dato informativo');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('info');
    expect(toasts[0].message).toBe('Dato informativo');
  });

  it('showWarning convenience method adds a warning toast', () => {
    const { showWarning } = useToastStore.getState();
    showWarning('Precaución');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('warning');
    expect(toasts[0].message).toBe('Precaución');
  });

  it('convenience methods accept optional duration', () => {
    const { showSuccess } = useToastStore.getState();
    showSuccess('Custom duration', 2000);

    const { toasts } = useToastStore.getState();
    expect(toasts[0].duration).toBe(2000);
  });
});

// ============================================================================
// REQ-TS-03: Dismiss Toast
// ============================================================================
describe('REQ-TS-03: Dismiss Toast', () => {
  it('dismissToast removes the toast by id', () => {
    const { showToast, dismissToast } = useToastStore.getState();
    showToast({ type: 'info', message: 'Removable' });

    const [toast] = useToastStore.getState().toasts;
    expect(toast).toBeDefined();

    dismissToast(toast.id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('dismissToast clears the pending auto-dismiss timer', () => {
    const { showToast, dismissToast } = useToastStore.getState();
    showToast({ type: 'success', message: 'Will be dismissed early' });

    const [toast] = useToastStore.getState().toasts;
    dismissToast(toast.id);

    // Advance time well past the default 4000ms auto-dismiss
    vi.advanceTimersByTime(10000);

    // Toast should NOT reappear or be dismissed again — it was already removed
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('dismissToast is a no-op for unknown id', () => {
    const { showToast } = useToastStore.getState();
    showToast({ type: 'info', message: 'Only toast' });
    const beforeLength = useToastStore.getState().toasts.length;

    useToastStore.getState().dismissToast('non-existent-id');
    expect(useToastStore.getState().toasts).toHaveLength(beforeLength);
  });
});

// ============================================================================
// REQ-TS-04: Clear All
// ============================================================================
describe('REQ-TS-04: Clear All', () => {
  it('clearToasts removes all toasts', () => {
    const { showToast, clearToasts } = useToastStore.getState();
    showToast({ type: 'info', message: 'Toast 1' });
    showToast({ type: 'success', message: 'Toast 2' });

    expect(useToastStore.getState().toasts).toHaveLength(2);

    clearToasts();
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('clearToasts clears all pending timers', () => {
    const { showToast, clearToasts } = useToastStore.getState();
    showToast({ type: 'success', message: 'Toast 1' });
    showToast({ type: 'info', message: 'Toast 2' });

    clearToasts();

    // Advance far beyond any default duration
    vi.advanceTimersByTime(20000);

    // No toasts should appear — all timers were cleared
    expect(useToastStore.getState().toasts).toEqual([]);
  });
});

// ============================================================================
// REQ-TS-05: Reset Store
// ============================================================================
describe('REQ-TS-05: Reset Store', () => {
  it('resetStore returns state to initialState', () => {
    const { showToast, resetStore } = useToastStore.getState();
    showToast({ type: 'error', message: 'Error' });
    showToast({ type: 'warning', message: 'Warning' });

    expect(useToastStore.getState().toasts).toHaveLength(2);

    resetStore();
    const state = useToastStore.getState();
    expect(state.toasts).toEqual([]);
  });

  it('resetStore clears all pending timers', () => {
    const { showToast, resetStore } = useToastStore.getState();
    showToast({ type: 'success', message: 'Toast 1' });

    resetStore();

    // Advance past default duration
    vi.advanceTimersByTime(10000);

    // No toasts should reappear
    expect(useToastStore.getState().toasts).toEqual([]);
  });
});

// ============================================================================
// REQ-TS-06: Auto-Dismiss Timer
// ============================================================================
describe('REQ-TS-06: Auto-Dismiss Timer', () => {
  it('success toast auto-dismisses after 4000ms by default', () => {
    const { showSuccess } = useToastStore.getState();
    showSuccess('Success');

    expect(useToastStore.getState().toasts).toHaveLength(1);

    // Before the timeout
    vi.advanceTimersByTime(3999);
    expect(useToastStore.getState().toasts).toHaveLength(1);

    // After the timeout
    vi.advanceTimersByTime(1);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('info toast auto-dismisses after 4000ms by default', () => {
    const { showInfo } = useToastStore.getState();
    showInfo('Info');

    vi.advanceTimersByTime(3999);
    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('warning toast auto-dismisses after 4000ms by default', () => {
    const { showWarning } = useToastStore.getState();
    showWarning('Warning');

    vi.advanceTimersByTime(3999);
    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('error toast auto-dismisses after 6000ms by default', () => {
    const { showError } = useToastStore.getState();
    showError('Error');

    expect(useToastStore.getState().toasts).toHaveLength(1);

    // Before the error timeout
    vi.advanceTimersByTime(5999);
    expect(useToastStore.getState().toasts).toHaveLength(1);

    // After the error timeout
    vi.advanceTimersByTime(1);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('per-toast duration override takes precedence', () => {
    const { showSuccess } = useToastStore.getState();
    showSuccess('Quick toast', 500);

    // Before override timeout
    vi.advanceTimersByTime(499);
    expect(useToastStore.getState().toasts).toHaveLength(1);

    // After override timeout
    vi.advanceTimersByTime(1);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });



  it('each toast has its own independent timer', () => {
    const { showInfo, showError } = useToastStore.getState();
    showInfo('Info toast');
    showError('Error toast');

    expect(useToastStore.getState().toasts).toHaveLength(2);

    // Info should dismiss at 4000ms
    vi.advanceTimersByTime(4000);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].type).toBe('error');

    // Error should dismiss at 6000ms (2000ms more from now)
    vi.advanceTimersByTime(2000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});

// ============================================================================
// REQ-TS-07: FIFO Eviction
// ============================================================================
describe('REQ-TS-07: FIFO Eviction', () => {
  it('evicts the oldest toast when adding a 4th toast', () => {
    const { showInfo } = useToastStore.getState();

    showInfo('Toast 1');
    showInfo('Toast 2');
    showInfo('Toast 3');

    expect(useToastStore.getState().toasts).toHaveLength(3);
    const oldest = useToastStore.getState().toasts[0];

    // Add 4th toast
    showInfo('Toast 4');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(3);

    // Oldest toast (index 0) should be evicted
    expect(toasts.find((t) => t.id === oldest.id)).toBeUndefined();

    // New toast (index 2) should be present
    expect(toasts[2].message).toBe('Toast 4');
  });

  it('clears the evicted toast timer', () => {
    const { showInfo } = useToastStore.getState();

    showInfo('Toast 1');
    showInfo('Toast 2');
    showInfo('Toast 3');

    // Get the oldest toast's id before eviction
    const oldestId = useToastStore.getState().toasts[0].id;

    // Evict by adding 4th
    showInfo('Toast 4');

    // Advance time past default duration
    vi.advanceTimersByTime(10000);

    // The evicted toast should NOT reappear (timer was cleared)
    expect(useToastStore.getState().toasts).toHaveLength(0);
    // Oldest id should NOT be in the array
    expect(
      useToastStore.getState().toasts.find((t) => t.id === oldestId),
    ).toBeUndefined();
  });

  it('FIFO works across multiple evictions', () => {
    const { showInfo } = useToastStore.getState();

    showInfo('A');
    showInfo('B');
    showInfo('C');
    // Queue: [A, B, C]

    showInfo('D');
    // Queue: [B, C, D] — A evicted
    let { toasts } = useToastStore.getState();
    expect(toasts.map((t) => t.message)).toEqual(['B', 'C', 'D']);

    showInfo('E');
    // Queue: [C, D, E] — B evicted
    toasts = useToastStore.getState().toasts;
    expect(toasts.map((t) => t.message)).toEqual(['C', 'D', 'E']);
  });
});

// ============================================================================
// REQ-TS-08: No Persistence
// ============================================================================
describe('REQ-TS-08: No Persistence', () => {


  it('adding a toast does NOT write to localStorage', () => {
    const setItemSpy = vi.spyOn(window.localStorage, 'setItem');

    useToastStore.getState().showSuccess('No persist');

    // setItem should not be called as a result of adding a toast
    // The toast store itself must not write to localStorage
    const wasCalledForToasts = setItemSpy.mock.calls.some(
      (call) => typeof call[0] === 'string' && call[0].includes('toast'),
    );
    expect(wasCalledForToasts).toBe(false);

    setItemSpy.mockRestore();
  });


});
