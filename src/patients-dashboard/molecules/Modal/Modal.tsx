import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';
import Icon from '@/patients-dashboard/atoms/Icon';
import Button from '@/patients-dashboard/atoms/Button';
import { useReducedMotionTransition } from '@/shared/motion/motion-presets';
import { useFocusTrap } from './useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  ariaLabel: string;
  children: ReactNode;
  triggerRef?: RefObject<HTMLElement | null>;
}

function Modal({ isOpen, onClose, title, ariaLabel, children, triggerRef }: ModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reducedTransition = useReducedMotionTransition();

  // Focus trap — wire triggerRef (default to closeButtonRef if not provided)
  const internalTriggerRef = useRef<HTMLButtonElement>(null);
  const resolvedTriggerRef = triggerRef ?? internalTriggerRef;
  const { panelRef } = useFocusTrap({ open: isOpen, triggerRef: resolvedTriggerRef });

  // --- Enfocar botón de cierre al abrir el modal ---
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // --- Teclado: Escape para cerrar ---
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-testid="modal-overlay"
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            'bg-slate-950/50 backdrop-blur-sm',
          )}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedTransition.duration }}
        >
          {/* Panel — evita la propagación del clic para no cerrar al hacer clic adentro */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={!title ? ariaLabel : undefined}
            className={cn(
              'relative w-full max-w-2xl mx-4 rounded-2xl',
              'border border-slate-200 bg-white shadow-xl',
              'dark:bg-slate-900 dark:border-slate-700',
              'flex flex-col max-h-[90vh]',
            )}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: reducedTransition.duration }}
          >
            {/* ---- Encabezado ---- */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="sm"
                aria-label="Cerrar"
                onClick={onClose}
              >
                <Icon name="close" size="sm" />
              </Button>
            </header>

            {/* ---- Cuerpo ---- */}
            <div className="overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
