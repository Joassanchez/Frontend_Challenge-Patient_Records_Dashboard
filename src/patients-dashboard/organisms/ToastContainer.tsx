import { cn } from '@/shared/utils/cn';
import Toast from '../atoms/Toast';
import { useToastStore, selectToasts } from '../store/toast.store';

// ---------------------------------------------------------------------------
// ToastContainer — Organism
// Reads the toast queue from the store and renders stacked Toast atoms.
// ---------------------------------------------------------------------------

export function ToastContainer() {
  const toasts = useToastStore(selectToasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-40 pointer-events-none',
        'inset-x-4 bottom-4',
        'sm:top-10 sm:right-6 sm:left-auto sm:bottom-auto', // desktop: top-right, below CTA
        'flex flex-col gap-2',
        'max-w-sm w-full',
      )}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={(id) => dismissToast(id)} />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
