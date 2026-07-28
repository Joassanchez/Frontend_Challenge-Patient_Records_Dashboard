import { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import Button from '@/patients-dashboard/atoms/Button';
import { useFavoritesStore, selectFavoriteIds } from '@/patients-dashboard/store/favorites.store';
import { usePatientsStore } from '@/patients-dashboard/store/patients.store';
import EmptyState from '@/patients-dashboard/molecules/EmptyState';
import DashboardSection from '../DashboardSection';
import PatientCardsGrid from '../PatientCardsGrid';

interface FavoritesSectionProps {
  className?: string;
}

const FAVORITES_PAGE_SIZE = 3;

function FavoritesSection({ className }: FavoritesSectionProps) {
  const headingId = 'favorites-section-heading';
  const [currentPage, setCurrentPage] = useState(1);

  // Selectores — derivan pacientes favoritos de ambos stores
  const favoritePatientIds = useFavoritesStore(selectFavoriteIds);
  const patients = usePatientsStore((s) => s.patients);

  // Join en memoria: solo muestra pacientes que existen en ambos stores
  const favoritePatients = patients.filter((p) =>
    favoritePatientIds.includes(p.id),
  );

  // Texto del contador — singular/plural, usa la cuenta COINCIDENTE (no la de localStorage)
  const counterText =
    favoritePatients.length === 1
      ? '1 paciente guardado'
      : `${favoritePatients.length} pacientes guardados`;
  const totalPages = Math.max(
    1,
    Math.ceil(favoritePatients.length / FAVORITES_PAGE_SIZE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const start = (safeCurrentPage - 1) * FAVORITES_PAGE_SIZE;
  const paginatedFavoritePatients = favoritePatients.slice(
    start,
    start + FAVORITES_PAGE_SIZE,
  );

  return (
    <DashboardSection
      headingId={headingId}
      title="Favoritos"
      counter={counterText}
      className={cn('w-full', className)}
    >
      {/* ---- Vacío: sin favoritos visibles ---- */}
      {favoritePatients.length === 0 && (
        <EmptyState
          icon="inbox"
          title="No tienes Pacientes Favoritos"
          description="Marcá pacientes como favoritos para verlos acá"
          action={{
            label: 'Ver pacientes',
            onClick: () => {
              const target = document.getElementById('patients-section-heading');
              target?.scrollIntoView({ behavior: 'smooth' });
            },
          }}
          variant="compact"
        />
      )}

      {/* ---- Éxito: grilla responsive de PatientCards favoritos ---- */}
      {favoritePatientIds.length > 0 && favoritePatients.length > 0 && (
        <>
          <PatientCardsGrid patients={paginatedFavoritePatients} isLoading={false} />

          {totalPages > 1 && (
            <nav
              aria-label="Paginación de favoritos"
              className="mt-4 flex flex-wrap items-center justify-center gap-3"
            >
              <Button
                variant="secondary"
                size="sm"
                disabled={safeCurrentPage === 1}
                className="rounded-full disabled:bg-slate-100 dark:disabled:bg-slate-700"
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Anterior
              </Button>
              <span
                aria-live="polite"
                className="text-sm font-medium text-slate-500 dark:text-slate-400"
              >
                Página {safeCurrentPage} de {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={safeCurrentPage === totalPages}
                className="rounded-full disabled:bg-slate-100 dark:disabled:bg-slate-700"
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Siguiente
              </Button>
            </nav>
          )}
        </>
      )}
    </DashboardSection>
  );
}

export default FavoritesSection;
