import { useState } from 'react';
import { motion } from 'motion/react';
import { cn, formatSafeDate, isValidWebUrl, formatWebsiteDisplay } from '@/shared/utils';
import { useFavoritesStore, selectIsFavorite } from '@/patients-dashboard/store/favorites.store';
import { usePatientsStore } from '@/patients-dashboard/store/patients.store';
import { useModalStore } from '@/patients-dashboard/store/modal.store';
import { useToastStore } from '@/patients-dashboard/store/toast.store';
import Avatar from '@/patients-dashboard/atoms/Avatar';
import Button from '@/patients-dashboard/atoms/Button';
import Icon from '@/patients-dashboard/atoms/Icon';
import StatusSwitch from '@/patients-dashboard/atoms/StatusSwitch';
import type { Patient } from '@/patients-dashboard/types/patient.types';
import { DUR, useReducedMotionTransition } from '@/shared/motion/motion-presets';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface PatientCardProps {
  patient: Patient;
  className?: string;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

function PatientCard({ patient, className }: PatientCardProps) {
  const websiteDisplay = formatWebsiteDisplay(patient.website);
  const [isExpanded, setIsExpanded] = useState(false);
  const [bounceTrigger, setBounceTrigger] = useState(0);
  const detailsId = `patient-details-${patient.id}`;
  const reducedTransition = useReducedMotionTransition();

  // Store de favoritos — conectado al toggle real (persistido)
  const isFavorite = useFavoritesStore(selectIsFavorite(patient.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  // Store del modal — conecta el botón "Editar"
  const openEditModal = useModalStore((s) => s.openEditModal);

  // Store de toasts — conectado al toggle de favoritos
  const showSuccess = useToastStore((s) => s.showSuccess);
  const showInfo = useToastStore((s) => s.showInfo);
  const showError = useToastStore((s) => s.showError);

  // Store de pacientes — para el toggle de status inline
  const updatePatientStatus = usePatientsStore((s) => s.updatePatientStatus);

  const patientStatus = patient.status || 'active';
  const isActive = patientStatus === 'active';

  function handleStatusToggle() {
    const prevStatus = patientStatus;
    const nextStatus: 'active' | 'inactive' = isActive ? 'inactive' : 'active';

    // Optimistic update
    const success = updatePatientStatus(patient.id, nextStatus);
    if (!success) {
      // Rollback
      updatePatientStatus(patient.id, prevStatus);
      showError('No se pudo actualizar el estado');
      return;
    }
    showSuccess(nextStatus === 'active' ? 'Paciente activado' : 'Paciente inactivado');
  }

  function handleFavoriteClick() {
    const wasFavorite = isFavorite;
    const result = toggleFavorite(patient.id);
    if (!result.success) return;
    setBounceTrigger((prev) => prev + 1);
    if (wasFavorite) {
      showInfo('Quitado de favoritos', {
        duration: 5000,
        action: {
          label: 'Deshacer',
          onClick: () => {
            toggleFavorite(patient.id);
            showSuccess('Restaurado a favoritos');
          },
        },
      });
    } else {
      showSuccess('Agregado a favoritos');
    }
  }

  return (
    <article
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4',
        'shadow-sm shadow-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/80',
        'dark:bg-slate-800 dark:border-slate-700 dark:shadow-black/20 dark:hover:border-slate-600',
        className,
      )}
    >
      {/* ---- Identidad: avatar + nombre ---- */}
      <div className="flex items-start gap-4">
        <Avatar
          name={patient.name}
          src={patient.avatar || undefined}
          size="lg"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-950 dark:text-slate-100">
              {patient.name}
            </h3>
            <span
              className={cn(
                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                patient.status === 'inactive'
                  ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
              )}
            >
              {patient.status === 'inactive' ? 'Inactivo' : 'Activo'}
            </span>
            <StatusSwitch
              checked={isActive}
              onChange={handleStatusToggle}
              ariaLabel={isActive ? `Desactivar ${patient.name}` : `Activar ${patient.name}`}
            />
          </div>
          {patient.description && (
              <p
                className={cn(
                  'text-sm leading-6 text-slate-500 dark:text-slate-400',
                  !isExpanded && 'line-clamp-2',
                )}
            >
              {patient.description}
            </p>
          )}
        </div>
      </div>

      {/* ---- Enlace al sitio web ---- */}
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

      {/* ---- Footer de acciones: Editar + Favorito + Ver más/menos ---- */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Editar ${patient.name}`}
          onClick={() => openEditModal(patient.id)}
        >
          <Icon name="edit" size="sm" />
          Editar
        </Button>

        <motion.div
          key={bounceTrigger}
          animate={{
            scale: reducedTransition.duration === 0
              ? 1
              : [0.85, 1.15, 1],
          }}
          transition={{
            duration: reducedTransition.duration || DUR.enter,
            times: [0, 0.5, 1],
          }}
          style={{ display: 'inline-flex' }}
        >
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
        </motion.div>

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

      {/* ---- Panel de detalles expandible ---- */}
      <div
        id={detailsId}
        role="region"
        aria-label={`Detalles de ${patient.name}`}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-in-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden" aria-hidden={!isExpanded || undefined}>
          {(() => {
            const formattedDate = formatSafeDate(patient.createdAt);
            if (formattedDate === null) return null;
            return (
              <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-700/50">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Fecha de registro:{' '}
                  <span className="text-slate-700 font-medium dark:text-slate-200">
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
