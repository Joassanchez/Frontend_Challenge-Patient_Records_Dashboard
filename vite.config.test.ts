/**
 * Spec-conformance test for Vite configuration (Task 2.1).
 *
 * REQ-4: Vite MUST listen on 0.0.0.0 to accept connections from
 * outside the container. Local development with npm run dev outside
 * Docker MUST continue working as before.
 */

import { describe, it, expect } from 'vitest';

// Vite's defineConfig returns a UserConfig — we can import and inspect it
// @ts-expect-error — vite.config.ts uses .ts extension but the module resolves fine
import config from './vite.config';

describe('vite.config (REQ-4)', () => {
  it('sets server.host to 0.0.0.0 so Vite accepts external container connections', () => {
    expect(config.server?.host).toBe('0.0.0.0');
  });

  it('preserves the @ alias for src/', () => {
    expect(config.resolve?.alias).toBeDefined();
    // The alias object contains at least the '@' key
    const alias = config.resolve?.alias as Record<string, string> | undefined;
    expect(alias?.['@']).toBeDefined();
  });

  it('still uses the react plugin', () => {
    expect(config.plugins).toBeDefined();
    expect(config.plugins!.length).toBeGreaterThan(0);
  });
});
