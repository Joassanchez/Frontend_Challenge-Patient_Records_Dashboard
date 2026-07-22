import { useEffect, useRef, type ReactNode } from 'react';
import type { Decorator } from '@storybook/react-vite';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ZustandStoreLike<T extends Record<string, unknown> = Record<string, unknown>> {
  getState(): T;
  setState(state: Partial<T>, replace?: boolean): void;
}

interface ZustandStoreParam {
  store: ZustandStoreLike;
  state: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Module augmentation — adds zustandStore to Storybook Parameters
// ---------------------------------------------------------------------------

declare module '@storybook/react-vite' {
  interface Parameters {
    zustandStore?: ZustandStoreParam | ZustandStoreParam[];
  }
}

// ---------------------------------------------------------------------------
// Internal component — manages store lifecycle via useEffect cleanup
// ---------------------------------------------------------------------------

interface StoreInjectorProps {
  stores: ZustandStoreParam[];
  children: ReactNode;
}

function StoreInjector({ stores, children }: StoreInjectorProps) {
  const snapshotsRef = useRef<Array<{ store: ZustandStoreLike; snap: Record<string, unknown> }>>([]);

  // Snapshot + apply on mount (runs synchronously before paint)
  if (snapshotsRef.current.length === 0) {
    snapshotsRef.current = stores.map(({ store }) => ({
      store,
      snap: { ...store.getState() },
    }));
    stores.forEach(({ store, state }) => {
      store.setState(state as Record<string, unknown>, true);
    });
  }

  useEffect(() => {
    return () => {
      // Restore original state on unmount
      snapshotsRef.current.forEach(({ store, snap }) => {
        store.setState(snap as Record<string, unknown>, true);
      });
    };
  }, []);

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Decorator
// ---------------------------------------------------------------------------

/**
 * Storybook decorator that injects initial state into Zustand stores.
 *
 * Reads `parameters.zustandStore` (single or array), calls `store.setState(state, true)`
 * before rendering, and restores the original state after unmount.
 */
export const withZustandStore: Decorator = (Story, context) => {
  const params = context.parameters.zustandStore as ZustandStoreParam | ZustandStoreParam[] | undefined;

  if (!params) {
    return Story();
  }

  const list = Array.isArray(params) ? params : [params];

  return (
    <StoreInjector stores={list}>
      {Story()}
    </StoreInjector>
  );
};
