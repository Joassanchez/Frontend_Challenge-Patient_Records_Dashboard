import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cssPath = resolve(__dirname, 'index.css');
let css: string;

function loadCss(): string {
  if (!css) {
    css = readFileSync(cssPath, 'utf-8');
  }
  return css;
}

describe('src/index.css – design token and base layer contract', () => {
  it('preserves the @import "tailwindcss" directive', () => {
    const content = loadCss();
    expect(content).toMatch(/@import\s+["']tailwindcss["']/);
  });

  it('defines @theme block with semantic tokens', () => {
    const content = loadCss();
    expect(content).toContain('@theme');
  });

  it.each([
    ['primary', '#2563eb'],
    ['success', '#16a34a'],
    ['error', '#dc2626'],
    ['favorite', '#f59e0b'],
    ['inactive', '#94a3b8'],
    ['surface', '#ffffff'],
    ['background', '#f8fafc'],
    ['text', '#0f172a'],
    ['text-muted', '#64748b'],
    ['border', '#e2e8f0'],
  ])('exposes --color-%s token mapped to %s', (role, value) => {
    const content = loadCss();
    const regex = new RegExp(`--color-${role}\\s*:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    expect(content).toMatch(regex);
  });

  it('defines @layer base for global defaults', () => {
    const content = loadCss();
    expect(content).toMatch(/@layer\s+base/);
  });

  it('sets html height to 100%', () => {
    const content = loadCss();
    expect(content).toMatch(/html\s*\{[^}]*height\s*:\s*100%/);
  });

  it('sets body min-height to 100%', () => {
    const content = loadCss();
    expect(content).toMatch(/body\s*\{[^}]*min-height\s*:\s*100%/);
  });

  it('applies box-sizing: border-box globally', () => {
    const content = loadCss();
    expect(content).toMatch(/box-sizing\s*:\s*border-box/);
  });

  it('styles h1 with font-weight and line-height', () => {
    const content = loadCss();
    expect(content).toMatch(/h1\s*\{[^}]*font-weight/);
    expect(content).toMatch(/h1\s*\{[^}]*line-height/);
  });

  it('styles h2 with font-weight and line-height', () => {
    const content = loadCss();
    expect(content).toMatch(/h2\s*\{[^}]*font-weight/);
    expect(content).toMatch(/h2\s*\{[^}]*line-height/);
  });
});
