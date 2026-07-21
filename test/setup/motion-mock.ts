/**
 * Mock global de motion/react.
 *
 * jsdom no soporta requestAnimationFrame, así que este mock reemplaza los
 * componentes de motion por elementos HTML planos y hace que AnimatePresence
 * monte/desmonte hijos de forma sincrónica.
 */
import { vi } from 'vitest';

vi.mock('motion/react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const { forwardRef, createElement } = React;

  // Fabrica un elemento HTML plano, eliminando props específicas de motion
  function createPassthrough(tag: string) {
    const Component = forwardRef((props: Record<string, unknown>, ref: unknown) => {
      const {
        initial, animate, exit,
        whileHover, whileTap, whileDrag, whileFocus,
        variants, transition, layout, layoutId,
        onAnimationStart, onAnimationComplete,
        ...rest
      } = props;
      void initial; void animate; void exit; void whileHover; void whileTap;
      void whileDrag; void whileFocus; void variants; void transition;
      void layout; void layoutId; void onAnimationStart; void onAnimationComplete;
      return createElement(tag, { ...rest, ref });
    });
    Component.displayName = `Motion${tag.charAt(0).toUpperCase()}${tag.slice(1)}`;
    return Component;
  }

  // Proxy para motion.div, motion.button, motion.article, etc.
  const motion = new Proxy({}, {
    get(_target, prop: string) {
      if (typeof prop === 'string' && prop !== 'then') {
        return createPassthrough(prop);
      }
      return undefined;
    },
  });

  // Renderiza hijos sincrónicamente (sin animación)
  function AnimatePresence({ children }: { children?: unknown }) {
    return children ?? null;
  }

  // Por defecto false; los tests pueden sobreescribir con vi.spyOn
  function useReducedMotion() {
    return false;
  }

  return { motion, AnimatePresence, useReducedMotion };
});
