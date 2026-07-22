import { useEffect, useRef, type ReactNode } from 'react';
import type { Decorator } from '@storybook/react-vite';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ZustandStoreLike<T extends object = object> {
  getState(): T;
  setState(state: Partial<T>, replace?: boolean): void;
}

interface ZustandStoreParam {
  store: ZustandStoreLike<object>;
  state: object;
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
  const snapshotsRef = useRef<Array<{ store: ZustandStoreLike<object>; snap: object }>>([]);

  // Snapshot + apply on mount (runs synchronously before paint)
  if (snapshotsRef.current.length === 0) {
    snapshotsRef.current = stores.map(({ store }) => ({
      store,
      snap: { ...store.getState() },
    }));
    stores.forEach(({ store, state }) => {
      store.setState(state as object, true);
    });
  }

  useEffect(() => {
    return () => {
      // Restore original state on unmount
      snapshotsRef.current.forEach(({ store, snap }) => {
        store.setState(snap as object, true);
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
