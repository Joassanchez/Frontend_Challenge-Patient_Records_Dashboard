import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';
import Toast from '../../atoms/Toast';
import { useToastStore, selectToasts } from '../../store/toast.store';
import { DUR, useReducedMotionTransition } from '@/shared/motion/motion-presets';

// ---------------------------------------------------------------------------
// ToastContainer — Organismo
// Lee la cola de toasts del store y renderiza los Toast atoms apilados.
// ---------------------------------------------------------------------------

export function ToastContainer() {
  const toasts = useToastStore(selectToasts);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const reducedTransition = useReducedMotionTransition();

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-40 pointer-events-none',
        'inset-x-4 bottom-4',
        'sm:top-10 sm:right-6 sm:left-auto sm:bottom-auto', // escritorio: esquina superior derecha, debajo del CTA
        'flex flex-col gap-2',
        'max-w-sm w-full',
      )}
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className="pointer-events-auto"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: reducedTransition.duration || DUR.toast }}
          >
            <Toast toast={toast} onDismiss={(id) => dismissToast(id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastContainer;
