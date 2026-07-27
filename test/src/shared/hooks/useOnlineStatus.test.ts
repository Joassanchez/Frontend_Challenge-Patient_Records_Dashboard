import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { useUiStore } from '@/patients-dashboard/store/ui.store';

describe('useOnlineStatus (REQ-OFF-01/03)', () => {
  beforeEach(() => {
    useUiStore.getState().resetStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets isOnline to false when offline event fires', () => {
    renderHook(() => useOnlineStatus());

    window.dispatchEvent(new Event('offline'));

    expect(useUiStore.getState().isOnline).toBe(false);
  });

  it('sets isOnline to true when online event fires', () => {
    useUiStore.getState().setOnline(false);
    renderHook(() => useOnlineStatus());

    window.dispatchEvent(new Event('online'));

    expect(useUiStore.getState().isOnline).toBe(true);
  });

  it('syncs initial navigator.onLine state on mount', () => {
    const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    renderHook(() => useOnlineStatus());

    expect(useUiStore.getState().isOnline).toBe(false);
    spy.mockRestore();
  });
});
