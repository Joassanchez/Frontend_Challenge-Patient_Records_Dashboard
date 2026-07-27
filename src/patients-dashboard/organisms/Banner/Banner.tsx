import { cn } from '@/shared/utils/cn';
import Icon from '@/patients-dashboard/atoms/Icon';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface BannerProps {
  message?: string;
  isStale?: boolean;
  isOffline?: boolean;
  onDismiss?: () => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Mensajes por defecto
// ---------------------------------------------------------------------------

const STALE_MESSAGE = 'No se pueden actualizar los datos. Mostrando información en caché.';
const OFFLINE_MESSAGE = 'Sin conexión — mostrando datos en caché';

// ---------------------------------------------------------------------------
// Banner — Organismo
// ---------------------------------------------------------------------------

function Banner({ message, isStale, isOffline, onDismiss, className }: BannerProps) {
  const displayMessage = message ?? (isOffline ? OFFLINE_MESSAGE : STALE_MESSAGE);

  const variantClass = isOffline
    ? 'bg-favorite/10 border-favorite/20 text-favorite'
    : isStale
      ? 'bg-primary/10 border-primary/20 text-primary'
      : 'bg-primary/10 border-primary/20 text-primary';

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium',
        variantClass,
        className,
      )}
    >
      <span aria-hidden="true">
        <Icon name="alert-circle" size="sm" />
      </span>
      <span className="flex-1">{displayMessage}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar notificación"
          className="shrink-0 rounded p-1 hover:opacity-80 focus-visible:ring-2 transition-opacity"
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
}

export default Banner;
