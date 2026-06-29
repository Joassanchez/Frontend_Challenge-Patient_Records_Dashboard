import { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import Avatar from '@/patients-dashboard/atoms/Avatar';
import Badge from '@/patients-dashboard/atoms/Badge';
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

  const handleNoOp = () => {
    // Placeholder: no state mutation, no navigation.
    // Future iterations will wire real behavior here.
  };

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-surface p-5',
        'shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      {/* ---- Identity: avatar + name + badge ---- */}
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
            <Badge variant="neutral" size="sm">
              {patient.description}
            </Badge>
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

      {/* ---- Action buttons (visual placeholders) ---- */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Ver detalle"
          onClick={handleNoOp}
        >
          <Icon name="eye" size="sm" />
          Ver detalle
        </Button>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Editar"
          onClick={handleNoOp}
        >
          <Icon name="edit" size="sm" />
          Editar
        </Button>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Favorito"
          onClick={handleNoOp}
        >
          <Icon name="heart" size="sm" />
          Favorito
        </Button>
      </div>

      {/* ---- Expand/collapse toggle ---- */}
      <Button
        variant="ghost"
        size="sm"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {isExpanded ? 'Ver menos' : 'Ver más'}
      </Button>

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
