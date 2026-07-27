import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useKeyboardShortcuts } from '@/shared/hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts (REQ-KBD-01)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fires callback when registered key is pressed', async () => {
    const user = userEvent.setup();
    const callback = vi.fn();

    renderHook(() => useKeyboardShortcuts({ n: callback }));

    await user.keyboard('n');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire when an input element is focused', async () => {
    const user = userEvent.setup();
    const callback = vi.fn();

    // Render an input and focus it
    const { container } = renderHook(() => useKeyboardShortcuts({ n: callback }));
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    await user.keyboard('n');
    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('does NOT fire when a textarea is focused', async () => {
    const user = userEvent.setup();
    const callback = vi.fn();

    renderHook(() => useKeyboardShortcuts({ n: callback }));
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    await user.keyboard('n');
    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('supports multiple shortcuts simultaneously', async () => {
    const user = userEvent.setup();
    const cbA = vi.fn();
    const cbB = vi.fn();

    renderHook(() => useKeyboardShortcuts({ a: cbA, b: cbB }));

    await user.keyboard('a');
    expect(cbA).toHaveBeenCalledTimes(1);
    expect(cbB).not.toHaveBeenCalled();

    await user.keyboard('b');
    expect(cbB).toHaveBeenCalledTimes(1);
  });

  it('cleans up listener on unmount', async () => {
    const user = userEvent.setup();
    const callback = vi.fn();

    const { unmount } = renderHook(() => useKeyboardShortcuts({ n: callback }));
    unmount();

    await user.keyboard('n');
    expect(callback).not.toHaveBeenCalled();
  });
});
