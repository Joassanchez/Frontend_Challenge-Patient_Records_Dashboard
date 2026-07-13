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

function isValidWebUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatWebsiteDisplay(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function formatSafeDate(iso: string | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-AR');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PatientCard({ patient, className }: PatientCardProps) {
  const websiteDisplay = formatWebsiteDisplay(patient.website);
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
    const persisted = toggleFavorite(patient.id);
    if (!persisted) return;
    if (wasFavorite) {
      showInfo('Quitado de favoritos');
    } else {
      showSuccess('Agregado a favoritos');
    }
  }

  return (
    <article
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4',
        'shadow-sm shadow-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/80',
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

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="truncate text-base font-semibold text-slate-950">
            {patient.name}
          </h3>
          {patient.description && (
            <p
              className={cn(
                'text-sm leading-6 text-slate-500',
                !isExpanded && 'line-clamp-2',
              )}
            >
              {patient.description}
            </p>
          )}
        </div>
      </div>

      {/* ---- Website link ---- */}
      {patient.website && isValidWebUrl(patient.website) ? (
        <a
          href={patient.website}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-sm font-medium text-slate-500',
            'transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-primary focus-visible:ring-offset-2',
          )}
        >
          <Icon name="eye" size="sm" />
          <span className="truncate max-w-[200px]">{websiteDisplay}</span>
        </a>
      ) : patient.website ? (
        <span className="inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-sm text-slate-400">
          <Icon name="eye" size="sm" />
          <span className="truncate max-w-[200px]">{websiteDisplay}</span>
        </span>
      ) : null}

      {/* ---- Actions footer: Editar + Favorito + Ver más/menos in one row ---- */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Editar ${patient.name}`}
          onClick={() => openEditModal(patient.id)}
        >
          <Icon name="edit" size="sm" />
          Editar
        </Button>

        <Button
          variant="ghost"
          size="sm"
          aria-label={
            isFavorite
              ? `Quitar ${patient.name} de favoritos`
              : `Agregar ${patient.name} a favoritos`
          }
          aria-pressed={isFavorite}
          className={cn(
            'rounded-full border border-transparent px-3',
            isFavorite
              ? 'bg-favorite/10 text-favorite hover:bg-favorite/15'
              : 'hover:bg-favorite/10 hover:text-favorite',
          )}
          onClick={handleFavoriteClick}
        >
          <Icon name="heart" size="sm" />
          Favorito
        </Button>

        <Button
          variant="secondary"
          size="sm"
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          className="ml-auto rounded-full border-primary/15 bg-primary/10 px-3 text-primary shadow-none hover:bg-primary/15 hover:text-primary"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </Button>
      </div>

      {/* ---- Expandable details panel ---- */}
      <div
        id={detailsId}
        role="region"
        aria-label={`Detalles de ${patient.name}`}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden" aria-hidden={!isExpanded || undefined}>
          {(() => {
            const formattedDate = formatSafeDate(patient.createdAt);
            if (formattedDate === null) return null;
            return (
              <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-500">
                  Fecha de registro:{' '}
                  <span className="text-slate-700 font-medium">
                    {formattedDate}
                  </span>
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    </article>
  );
}

export default PatientCard;
