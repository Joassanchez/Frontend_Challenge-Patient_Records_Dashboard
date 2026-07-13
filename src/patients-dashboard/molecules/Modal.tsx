import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import Icon from '@/patients-dashboard/atoms/Icon';
import Button from '@/patients-dashboard/atoms/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  ariaLabel: string;
  children: ReactNode;
}

function Modal({ isOpen, onClose, title, ariaLabel, children }: ModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  if (!isOpen) return null;

  return (
    <div
      data-testid="modal-overlay"
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-slate-950/50 backdrop-blur-sm',
      )}
      onClick={onClose}
    >
      {/* Panel — evita la propagación del clic para no cerrar al hacer clic adentro */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        className={cn(
          'relative w-full max-w-2xl mx-4 rounded-2xl',
          'border border-slate-200 bg-white shadow-xl',
          'flex flex-col max-h-[90vh]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---- Encabezado ---- */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id={titleId} className="text-lg font-semibold text-text">{title}</h2>
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
      </div>
    </div>
  );
}

export default Modal;
