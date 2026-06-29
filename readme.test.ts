/**
 * Spec-conformance test for README.md Docker documentation (Task 4.1).
 *
 * REQ-5: README MUST include minimal commands to build and run
 * the frontend with Docker Compose.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname ?? __dirname);

describe('README.md Docker section (REQ-5)', () => {
  it('documents docker compose up --build as the primary command', () => {
    const content = readFileSync(resolve(ROOT, 'README.md'), 'utf-8');
    expect(content).toContain('docker compose up --build');
  });

  it('includes the access URL http://localhost:5173', () => {
    const content = readFileSync(resolve(ROOT, 'README.md'), 'utf-8');
    expect(content).toContain('http://localhost:5173');
  });

  it('has a recognizable Docker section heading', () => {
    const content = readFileSync(resolve(ROOT, 'README.md'), 'utf-8');
    // The heading can be ## Docker or ## Running with Docker or similar
    expect(content).toMatch(/##\s+.*[Dd]ocker/);
  });
});
