import { cn } from '@/shared/utils/cn';
import Icon, { type IconName } from '../Icon';
import type { ToastMessage } from '../../store/toast.store';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Mapeos fijos — según design.md sección 2
// ---------------------------------------------------------------------------

type ToastVariant = ToastMessage['type'];

const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: 'bg-success/10 border-success/20 text-success',
  error: 'bg-error/10 border-error/20 text-error',
  info: 'bg-primary/10 border-primary/20 text-primary',
  warning: 'bg-favorite/10 border-favorite/20 text-favorite',
};

const VARIANT_ICON: Record<ToastVariant, IconName> = {
  success: 'check',
  error: 'alert-circle',
  info: 'inbox',
  warning: 'alert-circle',
};

const VARIANT_ROLE: Record<ToastVariant, 'status' | 'alert'> = {
  success: 'status',
  error: 'alert',
  info: 'status',
  warning: 'alert',
};

// ---------------------------------------------------------------------------
// Toast Atom — Presentacional
// ---------------------------------------------------------------------------

function Toast({ toast, onDismiss }: ToastProps) {
  const { type, message, id } = toast;
  const variantClass = VARIANT_CLASS[type];
  const icon = VARIANT_ICON[type];
  const role = VARIANT_ROLE[type];

  return (
    <div
      role={role}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg',
        'transition-all duration-300 ease-in-out',
        'hover:shadow-xl',
        variantClass,
      )}
    >
      {/* Ícono de variante — alineado a la izquierda, oculto de lectores de pantalla */}
      <span aria-hidden="true">
        <Icon name={icon} size="md" />
      </span>

      <span className="flex-1 text-sm font-medium">{message}</span>

      {/* Botón de cierre */}
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Cerrar notificación"
        className={cn(
          'shrink-0 rounded p-1',
          'hover:opacity-80 focus-visible:ring-2',
          'transition-opacity',
        )}
      >
        <Icon name="close" size="sm" />
      </button>
    </div>
  );
}

export default Toast;
