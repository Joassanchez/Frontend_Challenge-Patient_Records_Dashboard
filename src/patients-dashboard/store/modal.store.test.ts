import { describe, it, expect, beforeEach } from 'vitest';
import {
  useModalStore,
  selectIsOpen,
  selectModalMode,
  selectSelectedPatientId,
  initialState,
} from './modal.store';

// ---------------------------------------------------------------------------
// Test isolation — reset store before each test
// ---------------------------------------------------------------------------

beforeEach(() => {
  useModalStore.getState().resetStore();
});

// ============================================================================
// REQ-MS-01: Initial State
// ============================================================================

describe('REQ-MS-01: Initial State', () => {
  it('initializes with isOpen false, mode create, selectedPatientId null', () => {
    const state = useModalStore.getState();

    expect(state.isOpen).toBe(false);
    expect(state.mode).toBe('create');
    expect(state.selectedPatientId).toBeNull();
  });
});

// ============================================================================
// REQ-MS-02: openCreateModal
// ============================================================================

describe('REQ-MS-02: openCreateModal', () => {
  it('sets isOpen true, mode create, selectedPatientId null', () => {
    useModalStore.getState().openCreateModal();

    const state = useModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('create');
    expect(state.selectedPatientId).toBeNull();
  });
});

// ============================================================================
// REQ-MS-03: openEditModal
// ============================================================================

describe('REQ-MS-03: openEditModal', () => {
  it('sets isOpen true, mode edit, selectedPatientId to the given id', () => {
    useModalStore.getState().openEditModal('p1');

    const state = useModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('edit');
    expect(state.selectedPatientId).toBe('p1');
  });
});

// ============================================================================
// REQ-MS-04: closeModal
// ============================================================================

describe('REQ-MS-04: closeModal resets state', () => {
  it('resets isOpen, mode, and selectedPatientId to initial values', () => {
    // Start from a dirty state
    useModalStore.setState({ isOpen: true, mode: 'edit', selectedPatientId: 'p1' });

    useModalStore.getState().closeModal();

    const state = useModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.mode).toBe('create');
    expect(state.selectedPatientId).toBeNull();
  });
});

// ============================================================================
// REQ-MS-05: Exported Selectors
// ============================================================================

describe('REQ-MS-05: Exported Selectors', () => {
  it('selectIsOpen returns the isOpen flag', () => {
    useModalStore.setState({ isOpen: true });
    const state = useModalStore.getState();

    expect(selectIsOpen(state)).toBe(true);
  });

  it('selectIsOpen returns false when closed', () => {
    const state = useModalStore.getState();

    expect(selectIsOpen(state)).toBe(false);
  });

  it('selectModalMode returns the current mode', () => {
    useModalStore.setState({ mode: 'edit' });
    const state = useModalStore.getState();

    expect(selectModalMode(state)).toBe('edit');
  });

  it('selectSelectedPatientId returns the selected id', () => {
    useModalStore.setState({ selectedPatientId: 'p42' });
    const state = useModalStore.getState();

    expect(selectSelectedPatientId(state)).toBe('p42');
  });

  it('selectSelectedPatientId returns null when nothing selected', () => {
    const state = useModalStore.getState();

    expect(selectSelectedPatientId(state)).toBeNull();
  });
});

// ============================================================================
// REQ-MS-06: Test Isolation
// ============================================================================

describe('REQ-MS-06: Test Isolation', () => {
  it('exports initialState as a const with correct shape', () => {
    expect(initialState).toBeDefined();
    expect(initialState.isOpen).toBe(false);
    expect(initialState.mode).toBe('create');
    expect(initialState.selectedPatientId).toBeNull();
  });

  it('resetStore restores state to initial values', () => {
    useModalStore.setState({ isOpen: true, mode: 'edit', selectedPatientId: 'p99' });

    useModalStore.getState().resetStore();

    const state = useModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.mode).toBe('create');
    expect(state.selectedPatientId).toBeNull();
  });
});
