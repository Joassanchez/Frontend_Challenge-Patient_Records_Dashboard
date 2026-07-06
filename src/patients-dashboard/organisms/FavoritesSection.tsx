import { useMemo, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import Button from '@/patients-dashboard/atoms/Button';
import { useFavoritesStore, selectFavoriteIds } from '@/patients-dashboard/store/favorites.store';
import { usePatientsStore } from '@/patients-dashboard/store/patients.store';
import EmptyState from '@/patients-dashboard/molecules/EmptyState';
import DashboardSection from './DashboardSection';
import PatientCardsGrid from './PatientCardsGrid';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FavoritesSectionProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FAVORITES_PAGE_SIZE = 3;

function FavoritesSection({ className }: FavoritesSectionProps) {
  const headingId = 'favorites-section-heading';
  const [currentPage, setCurrentPage] = useState(1);

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
  const totalPages = Math.max(
    1,
    Math.ceil(favoritePatients.length / FAVORITES_PAGE_SIZE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedFavoritePatients = useMemo(() => {
    const start = (safeCurrentPage - 1) * FAVORITES_PAGE_SIZE;
    return favoritePatients.slice(start, start + FAVORITES_PAGE_SIZE);
  }, [safeCurrentPage, favoritePatients]);

  return (
    <DashboardSection
      headingId={headingId}
      title="Favoritos"
      counter={counterText}
      className={cn('w-full', className)}
    >
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
        <>
          <PatientCardsGrid patients={paginatedFavoritePatients} />

          {totalPages > 1 && (
            <nav
              aria-label="Paginación de favoritos"
              className="mt-4 flex items-center justify-center gap-3"
            >
              <Button
                variant="secondary"
                size="sm"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-text-muted">
                Página {safeCurrentPage} de {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={safeCurrentPage === totalPages}
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
