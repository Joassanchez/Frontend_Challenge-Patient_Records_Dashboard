import { useEffect } from 'react';

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * Registers global keyboard shortcuts. Skips firing when an input/textarea/select
 * is focused to avoid conflicts with form typing.
 *
 * @param map - Record of key (lowercase) → callback
 */
export function useKeyboardShortcuts(map: Record<string, () => void>): void {
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;

      // Skip when input-like element is focused
      if (
        INPUT_TAGS.has(target.tagName) ||
        target.isContentEditable ||
        target.getAttribute('role') === 'textbox'
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const callback = map[key];
      if (callback) {
        e.preventDefault();
        callback();
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [map]);
}
