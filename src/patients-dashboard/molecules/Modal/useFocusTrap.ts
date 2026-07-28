import { useEffect, useRef, type RefObject } from 'react';

// ---------------------------------------------------------------------------
// Focusable selector — matches all keyboard-focusable elements
// ---------------------------------------------------------------------------

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FocusTrapOptions {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFocusTrap({ open, triggerRef }: FocusTrapOptions) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      // Restore focus to the trigger when the modal closes
      triggerRef.current?.focus();
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      const panelEl = panelRef.current;
      if (!panelEl) return;

      const focusable = Array.from(
        panelEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if focus is on first, wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if focus is on last, wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, triggerRef]);

  return { panelRef };
}
