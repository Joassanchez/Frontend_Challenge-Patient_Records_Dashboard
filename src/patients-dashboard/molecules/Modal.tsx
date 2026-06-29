import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import Icon from '@/patients-dashboard/atoms/Icon';
import Button from '@/patients-dashboard/atoms/Button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  ariaLabel: string;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function Modal({ isOpen, onClose, title, ariaLabel, children }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // --- Focus close button when modal opens ---
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // --- Keyboard: Escape to close ---
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

  // --- Don't render anything when closed ---
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
      {/* Panel — stops click propagation to avoid closing on inner clicks */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          'relative w-full max-w-2xl mx-4 rounded-2xl',
          'border border-slate-200 bg-white shadow-xl',
          'flex flex-col max-h-[90vh]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---- Header ---- */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
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

        {/* ---- Body ---- */}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
