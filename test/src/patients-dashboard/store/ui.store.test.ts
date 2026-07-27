import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from '@/patients-dashboard/store/ui.store';

describe('ui.store (REQ-OFF-01)', () => {
  beforeEach(() => {
    useUiStore.getState().resetStore();
  });

  it('initial state has isOnline = true', () => {
    expect(useUiStore.getState().isOnline).toBe(true);
  });

  it('setOnline(false) sets isOnline to false', () => {
    useUiStore.getState().setOnline(false);
    expect(useUiStore.getState().isOnline).toBe(false);
  });

  it('setOnline(true) sets isOnline to true', () => {
    useUiStore.getState().setOnline(false);
    useUiStore.getState().setOnline(true);
    expect(useUiStore.getState().isOnline).toBe(true);
  });

  it('resetStore returns isOnline to true', () => {
    useUiStore.getState().setOnline(false);
    useUiStore.getState().resetStore();
    expect(useUiStore.getState().isOnline).toBe(true);
  });
});
