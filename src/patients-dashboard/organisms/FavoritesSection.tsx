import { cn } from '@/shared/utils/cn';
import { useFavoritesStore, selectFavoriteIds } from '@/patients-dashboard/store/favorites.store';
import { usePatientsStore } from '@/patients-dashboard/store/patients.store';
import EmptyState from '@/patients-dashboard/molecules/EmptyState';
import PatientCard from './PatientCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FavoritesSectionProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function FavoritesSection({ className }: FavoritesSectionProps) {
  const headingId = 'favorites-section-heading';

  // Selectors — derive favorite patients from both stores
  const favoritePatientIds = useFavoritesStore(selectFavoriteIds);
  const patients = usePatientsStore((s) => s.patients);

  // Inline join: only show patients that exist in both stores
  const favoritePatients = patients.filter((p) =>
    favoritePatientIds.includes(p.id),
  );

  // Counter copy — singular/plural, uses MATCHED count (not localStorage count)
  const counterText =
    favoritePatients.length === 1
      ? '1 paciente guardado'
      : `${favoritePatients.length} pacientes guardados`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn('w-full', className)}
    >
      <div className="flex items-baseline gap-2 mb-4">
        <h2 id={headingId} className="text-lg font-semibold text-slate-800">
          Favoritos
        </h2>
        <span className="text-sm text-text-muted">{counterText}</span>
      </div>

      {/* ---- Empty: no favorites at all ---- */}
      {favoritePatientIds.length === 0 && (
        <EmptyState
          icon="inbox"
          title="Todavía no marcaste favoritos"
          description="Guardá pacientes importantes para accederlos más rápido"
          variant="compact"
        />
      )}

      {/* ---- Graceful empty: favorites exist but patients not loaded ---- */}
      {favoritePatientIds.length > 0 && favoritePatients.length === 0 && (
        <EmptyState
          icon="inbox"
          title="Tus favoritos aparecerán acá"
          description="Tus favoritos aparecerán cuando la lista de pacientes esté disponible"
          variant="compact"
        />
      )}

      {/* ---- Success: responsive grid of favorite PatientCards ---- */}
      {favoritePatientIds.length > 0 && favoritePatients.length > 0 && (
        <div
          className={cn(
            'grid gap-4',
            'grid-cols-1',
            'md:grid-cols-2',
            'lg:grid-cols-3',
          )}
        >
          {favoritePatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </section>
  );
}

export default FavoritesSection;
