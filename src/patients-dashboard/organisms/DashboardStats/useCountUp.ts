import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to `target` over `durationMs` using requestAnimationFrame
 * with an ease-out curve. Short-circuits to the final value when the user
 * prefers reduced motion.
 */
export function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Short-circuit for reduced motion
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    if (target === 0) {
      setValue(0);
      return;
    }

    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick);
      }
    }

    rafId.current = requestAnimationFrame(tick);

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [target, durationMs]);

  return value;
}
