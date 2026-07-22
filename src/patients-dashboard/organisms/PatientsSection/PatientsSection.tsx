import { cn } from '@/shared/utils/cn';
import { usePatientsStore } from '@/patients-dashboard/store/patients.store';
import EmptyState from '@/patients-dashboard/molecules/EmptyState';
import ErrorMessage from '@/patients-dashboard/molecules/ErrorMessage';
import SearchInput from '@/patients-dashboard/molecules/SearchInput';
import Spinner from '@/patients-dashboard/atoms/Spinner';
import Button from '@/patients-dashboard/atoms/Button';
import DashboardSection from '../DashboardSection';
import PatientCardsGrid from '../PatientCardsGrid';
import { usePatientsSearch } from './usePatientsSearch';
import { useInfiniteScroll } from './useInfiniteScroll';

interface PatientsSectionProps {
  className?: string;
}

function PatientsSection({ className }: PatientsSectionProps) {
  const headingId = 'patients-section-heading';

  const patients = usePatientsStore((s) => s.patients);
  const isLoading = usePatientsStore((s) => s.isLoading);
  const isLoadingMore = usePatientsStore((s) => s.isLoadingMore);
  const hasMore = usePatientsStore((s) => s.hasMore);
  const error = usePatientsStore((s) => s.error);
  const loadPatients = usePatientsStore((s) => s.loadPatients);
  const loadNextPatientsPage = usePatientsStore((s) => s.loadNextPatientsPage);

  const { searchInput, setSearchInput } = usePatientsSearch();
  const { loadMoreRef } = useInfiniteScroll(
    hasMore,
    isLoadingMore,
    loadNextPatientsPage,
  );

  const showContent = !isLoading && !error;
  const hasPatients = patients.length > 0;

  // Texto del contador: refleja los resultados cargados, no un total global.
  const count = patients.length;
  const counterText =
    count === 1 ? '1 registro encontrado' : `${count} registros encontrados`;
  const sectionCounter = showContent && hasPatients ? counterText : undefined;
  // El buscador se muestra en todos los estados de contenido (vacío, sin
  // resultados y éxito). Solo se oculta durante el loading inicial o errores.
  const sectionActions = showContent ? (
    <SearchInput
      value={searchInput}
      onChange={setSearchInput}
      placeholder="Buscar por nombre o descripción"
    />
  ) : undefined;

  return (
    <DashboardSection
      headingId={headingId}
      title="Pacientes"
      counter={sectionCounter}
      actions={sectionActions}
      className={cn('w-full', className)}
    >
      {/* ---- Cargando ---- */}
      {isLoading && (
        <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {/* ---- Error ---- */}
      {!isLoading && error && (
        <div className="flex flex-col items-center gap-4 py-8">
          <ErrorMessage message={error} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadPatients(searchInput.trim())}
          >
            Intentar de nuevo
          </Button>
        </div>
      )}

      {/* Vacío: sin pacientes */}
      {showContent && !hasPatients && (
        <EmptyState
          icon={searchInput.trim() ? 'search' : 'user'}
          title={
            searchInput.trim()
              ? 'No hay resultados'
              : 'No hay pacientes cargados'
          }
          description={
            searchInput.trim()
              ? `No se encontraron pacientes para "${searchInput.trim()}"`
              : 'Creá tu primer paciente para empezar'
          }
        />
      )}

      {/* Éxito: grilla */}
      {showContent && hasPatients && (
        <>
          <PatientCardsGrid patients={patients} isLoading={false} />

          {hasMore && (
            <div ref={loadMoreRef} className="mt-5 flex justify-center">
              {isLoadingMore && <Spinner size="md" color="primary" />}
            </div>
          )}
        </>
      )}
    </DashboardSection>
  );
}

export default PatientsSection;
