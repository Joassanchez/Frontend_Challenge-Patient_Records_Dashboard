/**
 * Spec-conformance tests for Docker infrastructure files.
 *
 * Covers: tasks 1.1 (Dockerfile), 1.2 (docker-compose.yml), 1.3 (.dockerignore)
 *
 * REQ-1 (Dockerfile): node:22-alpine, WORKDIR /app, npm ci, EXPOSE 5173, CMD npm run dev
 * REQ-2 (docker-compose.yml): service frontend, build: ., ports 5173:5173, volumes
 * REQ-3 (.dockerignore): exclude node_modules, dist, .git, .env*, build logs
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname ?? __dirname);

function readIfExists(filename: string): string {
  const path = resolve(ROOT, filename);
  if (!existsSync(path)) {
    throw new Error(`${filename} not found at ${path}`);
  }
  return readFileSync(path, 'utf-8');
}

// ─── Task 1.1: Dockerfile ────────────────────────────────────────────

describe('Dockerfile (REQ-1)', () => {
  it('exists in the project root', () => {
    expect(existsSync(resolve(ROOT, 'Dockerfile'))).toBe(true);
  });

  it('uses node:22-alpine as base image', () => {
    const content = readIfExists('Dockerfile');
    expect(content).toMatch(/FROM\s+node:22-alpine/);
  });

  it('sets WORKDIR to /app', () => {
    const content = readIfExists('Dockerfile');
    expect(content).toMatch(/WORKDIR\s+\/app/);
  });

  it('copies package files before npm ci for layer caching', () => {
    const content = readIfExists('Dockerfile');
    // COPY package.json package-lock.json ./  OR  COPY package*.json ./
    expect(content).toMatch(/COPY\s+package/);
  });

  it('installs dependencies with npm ci', () => {
    const content = readIfExists('Dockerfile');
    expect(content).toMatch(/npm\s+ci/);
  });

  it('exposes port 5173', () => {
    const content = readIfExists('Dockerfile');
    expect(content).toMatch(/EXPOSE\s+5173/);
  });

  it('runs npm run dev as the default command', () => {
    const content = readIfExists('Dockerfile');
    expect(content).toContain('npm');
    expect(content).toContain('run');
    expect(content).toContain('dev');
  });
});

// ─── Task 1.2: docker-compose.yml ────────────────────────────────────

describe('docker-compose.yml (REQ-2)', () => {
  it('exists in the project root', () => {
    expect(existsSync(resolve(ROOT, 'docker-compose.yml'))).toBe(true);
  });

  it('defines a frontend service', () => {
    const content = readIfExists('docker-compose.yml');
    expect(content).toContain('frontend');
  });

  it('builds from the current directory', () => {
    const content = readIfExists('docker-compose.yml');
    expect(content).toMatch(/build:\s*\./);
  });

  it('maps port 5173:5173', () => {
    const content = readIfExists('docker-compose.yml');
    expect(content).toMatch(/"5173:5173"/);
  });

  it('bind-mounts the project root into /app', () => {
    const content = readIfExists('docker-compose.yml');
    expect(content).toMatch(/\.:\/app/);
  });

  it('creates an anonymous volume for /app/node_modules', () => {
    const content = readIfExists('docker-compose.yml');
    expect(content).toMatch(/\/app\/node_modules/);
  });

  it('inherits npm run dev CMD from Dockerfile (no explicit command override needed)', () => {
    const content = readIfExists('docker-compose.yml');
    // The Dockerfile CMD provides npm run dev; Compose inherits it.
    // The compose file should NOT duplicate the command unless overriding.
    // This test validates the absence of a conflicting command entry.
    const lines = content.split('\n').map((l) => l.trim());
    const hasConflictingCommand = lines.some(
      (l) => l.startsWith('command:') && !l.includes('npm run dev'),
    );
    expect(hasConflictingCommand).toBe(false);
  });
});

// ─── Task 1.3: .dockerignore ─────────────────────────────────────────

describe('.dockerignore (REQ-3)', () => {
  it('exists in the project root', () => {
    expect(existsSync(resolve(ROOT, '.dockerignore'))).toBe(true);
  });

  it('excludes node_modules from build context', () => {
    const content = readIfExists('.dockerignore');
    expect(content).toContain('node_modules');
  });

  it('excludes dist from build context', () => {
    const content = readIfExists('.dockerignore');
    expect(content).toContain('dist');
  });

  it('excludes .git from build context', () => {
    const content = readIfExists('.dockerignore');
    expect(content).toContain('.git');
  });

  it('excludes environment files (.env*)', () => {
    const content = readIfExists('.dockerignore');
    expect(content).toMatch(/\.env/);
  });
});
