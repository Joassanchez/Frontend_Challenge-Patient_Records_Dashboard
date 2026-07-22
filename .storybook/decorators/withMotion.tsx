import type { Decorator } from '@storybook/react-vite';

// ---------------------------------------------------------------------------
// Module augmentation — adds disableMotion to Storybook Parameters
// ---------------------------------------------------------------------------

declare module '@storybook/react-vite' {
  interface Parameters {
    /** When true, suppresses all CSS animations and transitions for deterministic screenshots. */
    disableMotion?: boolean;
  }
}

// ---------------------------------------------------------------------------
// CSS reset — injected as <style> tag when disableMotion is active
// ---------------------------------------------------------------------------

const MOTION_RESET_CSS = `
.sb-disable-motion *,
.sb-disable-motion *::before,
.sb-disable-motion *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}
`;

// ---------------------------------------------------------------------------
// Decorator
// ---------------------------------------------------------------------------

/**
 * Storybook decorator for motion/react handling.
 *
 * When `parameters.disableMotion` is true, injects a `<style>` tag that cancels
 * all CSS animations and transitions, and wraps the story in a container with
 * `class="sb-disable-motion"`. This produces deterministic, snapshot-ready output
 * without modifying component code.
 *
 * When `disableMotion` is false or unset, the story renders with native motion
 * animations intact.
 */
export const withMotion: Decorator = (Story, context) => {
  const disable = context.parameters.disableMotion === true;

  if (!disable) {
    return Story(context);
  }

  return (
    <>
      <style>{MOTION_RESET_CSS}</style>
      <div className="sb-disable-motion">
        <Story {...context} />
      </div>
    </>
  );
};
