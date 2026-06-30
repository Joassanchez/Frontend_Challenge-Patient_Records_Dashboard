import { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { useFavoritesStore, selectIsFavorite } from '@/patients-dashboard/store/favorites.store';
import { useModalStore } from '@/patients-dashboard/store/modal.store';
import { useToastStore } from '@/patients-dashboard/store/toast.store';
import Avatar from '@/patients-dashboard/atoms/Avatar';
import Button from '@/patients-dashboard/atoms/Button';
import Icon from '@/patients-dashboard/atoms/Icon';
import type { Patient } from '@/patients-dashboard/types/patient.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PatientCardProps {
  patient: Patient;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatWebsiteDisplay(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PatientCard({ patient, className }: PatientCardProps) {
  const websiteDisplay = formatWebsiteDisplay(patient.webpage);
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsId = `patient-details-${patient.id}`;

  // Favorites store — wired to real toggle
  const isFavorite = useFavoritesStore(selectIsFavorite(patient.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  // Modal store — wire "Editar" button
  const openEditModal = useModalStore((s) => s.openEditModal);

  // Toast store — wired to favorite toggle
  const showSuccess = useToastStore((s) => s.showSuccess);
  const showInfo = useToastStore((s) => s.showInfo);

  function handleFavoriteClick() {
    const wasFavorite = isFavorite;
    toggleFavorite(patient.id);
    if (wasFavorite) {
      showInfo('Quitado de favoritos');
    } else {
      showSuccess('Agregado a favoritos');
    }
  }

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-surface p-4',
        'shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      {/* ---- Identity: avatar + name ---- */}
      <div className="flex items-start gap-4">
        <Avatar
          name={patient.name}
          src={patient.avatar || undefined}
          size="lg"
        />

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h3 className="text-base font-semibold text-text truncate">
            {patient.name}
          </h3>
          {patient.description && (
            <p
              className={cn(
                'text-sm text-text-muted',
                !isExpanded && 'line-clamp-2',
              )}
            >
              {patient.description}
            </p>
          )}
        </div>
      </div>

      {/* ---- Website link ---- */}
      {patient.webpage && (
        <a
          href={patient.webpage}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-1.5 self-start text-sm text-primary',
            'hover:underline focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-primary focus-visible:ring-offset-2 rounded',
          )}
        >
          <Icon name="eye" size="sm" />
          <span className="truncate max-w-[200px]">{websiteDisplay}</span>
        </a>
      )}

      {/* ---- Actions footer: Editar + Favorito + Ver más/menos in one row ---- */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Editar"
          onClick={() => openEditModal(patient.id)}
        >
          <Icon name="edit" size="sm" />
          Editar
        </Button>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Favorito"
          aria-pressed={isFavorite}
          className={cn(
            isFavorite && 'text-favorite bg-favorite/10 hover:bg-favorite/15',
          )}
          onClick={handleFavoriteClick}
        >
          <Icon name="heart" size="sm" />
          Favorito
        </Button>

        <Button
          variant="ghost"
          size="sm"
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          className="ml-auto"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </Button>
      </div>

      {/* ---- Expandable details panel ---- */}
      <div
        id={detailsId}
        role="region"
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden" aria-hidden={!isExpanded || undefined}>
          {patient.createdAt && (
            <div className="bg-slate-50 rounded-lg px-4 py-3 mt-2">
              <p className="text-sm text-slate-500">
                Fecha de registro:{' '}
                <span className="text-slate-700 font-medium">
                  {new Date(patient.createdAt).toLocaleDateString('es-AR')}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default PatientCard;
