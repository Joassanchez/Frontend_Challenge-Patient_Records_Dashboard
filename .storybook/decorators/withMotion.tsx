import type { Decorator } from '@storybook/react-vite';

// ---------------------------------------------------------------------------
// Module augmentation — adds disableMotion to Storybook Parameters
// ---------------------------------------------------------------------------

declare module '@storybook/react-vite' {
  interface Parameters {
    disableMotion?: boolean;
  }
}

// ---------------------------------------------------------------------------
// Decorator
// ---------------------------------------------------------------------------

/**
 * Storybook decorator for motion/react handling.
 *
 * In Storybook's browser environment, motion animations run natively (unlike jsdom).
 * This decorator provides a `parameters.disableMotion` flag that stories can use
 * to opt into deterministic rendering. The actual motion mock is handled by
 * Storybook's Vite config aliasing or by individual stories.
 *
 * For now, this is a passthrough decorator that preserves the story output.
 * Stories that need deterministic motion can set `parameters.disableMotion: true`
 * and use the motion mock pattern from test/setup/motion-mock.ts.
 */
export const withMotion: Decorator = (Story) => {
  return Story();
};
