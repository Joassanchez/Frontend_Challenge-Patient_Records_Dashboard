import { useReducedMotion } from 'motion/react';

/** Duraciones base para animaciones (segundos). */
export const DUR = {
  enter: 0.2,
  exit: 0.2,
  toast: 0.25,
} as const;

/** Retardo entre cards del stagger (segundos). */
export const STAGGER_STEP = 0.05;

/** Devuelve duración 0 si el usuario tiene movimiento reducido activado. */
export function useReducedMotionTransition() {
  const prefersReduced = useReducedMotion();
  return { duration: prefersReduced ? 0 : DUR.enter };
}
