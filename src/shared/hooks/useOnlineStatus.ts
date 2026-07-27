import { useEffect } from 'react';
import { useUiStore } from '@/patients-dashboard/store/ui.store';

/**
 * Syncs the UI store's `isOnline` flag with the browser's online/offline events.
 * Also reads the initial state from `navigator.onLine` on mount.
 */
export function useOnlineStatus(): void {
  const setOnline = useUiStore((s) => s.setOnline);

  useEffect(() => {
    // Sync initial state
    setOnline(navigator.onLine);

    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);
}
