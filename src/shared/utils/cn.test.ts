import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('merges class names with clsx behavior', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toBe('px-4 py-2');
  });

  it('resolves conditional classes', () => {
    const result = cn('base', false && 'hidden', undefined, 'extra');
    expect(result).toBe('base extra');
  });

  it('resolves Tailwind conflicts using tailwind-merge', () => {
    const result = cn('px-4 py-2', 'px-6');
    expect(result).toBe('py-2 px-6');
  });

  it('returns empty string for no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles array of classes', () => {
    const result = cn(['px-4', 'py-2']);
    expect(result).toBe('px-4 py-2');
  });
});
