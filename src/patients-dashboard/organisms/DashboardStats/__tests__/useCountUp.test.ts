import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountUp } from '../useCountUp';

// ---------------------------------------------------------------------------
// rAF mock — jsdom doesn't have requestAnimationFrame
// ---------------------------------------------------------------------------

let rafCallbacks: Array<(time: number) => void> = [];
let currentTime = 0;

beforeEach(() => {
  rafCallbacks = [];
  currentTime = 0;

  vi.stubGlobal('requestAnimationFrame', (cb: (time: number) => void) => {
    rafCallbacks.push(cb);
    return rafCallbacks.length;
  });

  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  // Align performance.now() with our mock timeline
  vi.spyOn(performance, 'now').mockImplementation(() => currentTime);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function advanceRaf(ms: number) {
  currentTime += ms;
  const cbs = [...rafCallbacks];
  rafCallbacks = [];
  cbs.forEach((cb) => cb(currentTime));
}

// ---------------------------------------------------------------------------
// matchMedia mock for prefers-reduced-motion
// ---------------------------------------------------------------------------

function setReducedMotion(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? reduced : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useCountUp', () => {
  it('animates from 0 to target over ~800ms', () => {
    setReducedMotion(false);
    const { result } = renderHook(() => useCountUp(100, 800));

    // Initially 0
    expect(result.current).toBe(0);

    // Advance halfway (~400ms) — should be roughly half the target
    act(() => advanceRaf(400));
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);

    // Advance to end (800ms total)
    act(() => advanceRaf(400));
    expect(result.current).toBe(100);
  });

  it('short-circuits to final value when prefers-reduced-motion is set', () => {
    setReducedMotion(true);
    const { result } = renderHook(() => useCountUp(42, 800));

    // Should be the target immediately
    expect(result.current).toBe(42);
  });

  it('returns 0 when target is 0', () => {
    setReducedMotion(false);
    const { result } = renderHook(() => useCountUp(0, 800));
    expect(result.current).toBe(0);
  });
});
