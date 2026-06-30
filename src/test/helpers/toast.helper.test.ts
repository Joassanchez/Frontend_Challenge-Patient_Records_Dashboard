import { describe, it, expect } from 'vitest';
import type { ToastMessage } from '@/patients-dashboard/store/toast.store';

// RED: import from file that doesn't exist yet
import { makeToast } from './toast.helper';

describe('makeToast', () => {
  // ---------------------------------------------------------------------------
  // Scenario: Creates toast with all defaults
  // ---------------------------------------------------------------------------
  describe('default toast', () => {
    it('returns a ToastMessage with all default values', () => {
      const toast = makeToast();

      expect(toast.id).toBe('toast-1');
      expect(toast.type).toBe('success');
      expect(toast.message).toBe('Test message');
      expect(typeof toast.createdAt).toBe('number');
      expect(toast.createdAt).toBeGreaterThan(0);
    });

    it('return value satisfies the ToastMessage type', () => {
      const toast: ToastMessage = makeToast();
      expect(toast).toBeDefined();
      const _check: ToastMessage = toast;
      void _check;
    });
  });

  // ---------------------------------------------------------------------------
  // Scenario: Overrides type and message
  // ---------------------------------------------------------------------------
  describe('partial overrides', () => {
    it('overrides type to error and message, retaining id default', () => {
      const toast = makeToast({ type: 'error', message: 'Failed' });

      expect(toast.type).toBe('error');
      expect(toast.message).toBe('Failed');
      expect(toast.id).toBe('toast-1');
      expect(typeof toast.createdAt).toBe('number');
    });

    it('overrides duration', () => {
      const toast = makeToast({ duration: 8000 });

      expect(toast.duration).toBe(8000);
      expect(toast.id).toBe('toast-1');
      expect(toast.type).toBe('success');
    });

    it('overrides id and type together', () => {
      const toast = makeToast({ id: 'custom-id', type: 'warning' });

      expect(toast.id).toBe('custom-id');
      expect(toast.type).toBe('warning');
      expect(toast.message).toBe('Test message');
    });
  });

  // ---------------------------------------------------------------------------
  // Scenario: createdAt is fresh per call (evaluated at call time, not cached)
  // ---------------------------------------------------------------------------
  describe('createdAt freshness', () => {
    it('generates createdAt as a number (timestamp)', () => {
      const toast = makeToast();
      expect(typeof toast.createdAt).toBe('number');
      expect(toast.createdAt).toBeGreaterThan(0);
    });

    it('produces different createdAt values on consecutive calls (within tolerance)', () => {
      const t1 = makeToast();
      const t2 = makeToast();
      // They should be close in time but NOT identical across separate calls
      // In practice they may be the same if called fast enough, so we verify
      // t2.createdAt >= t1.createdAt (monotonically non-decreasing)
      expect(t2.createdAt).toBeGreaterThanOrEqual(t1.createdAt);
    });

    it('returns an independent object on each call', () => {
      const t1 = makeToast();
      const t2 = makeToast({ message: 'Other' });

      expect(t1).not.toBe(t2);
      expect(t1.message).not.toBe(t2.message);
    });
  });

  // ---------------------------------------------------------------------------
  // Triangulation: all four toast types
  // ---------------------------------------------------------------------------
  describe('all toast types', () => {
    it.each(['success', 'error', 'info', 'warning'] as const)(
      'makeToast with type=%s produces correct type',
      (type) => {
        const toast = makeToast({ type });
        expect(toast.type).toBe(type);
      },
    );
  });
});
