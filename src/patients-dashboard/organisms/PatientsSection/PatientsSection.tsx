import { useState } from 'react';
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

type StatusFilter = 'all' | 'active' | 'inactive';

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

interface PatientsSectionProps {
  className?: string;
}

function PatientsSection({ className }: PatientsSectionProps) {
  const headingId = 'patients-section-heading';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const patients = usePatientsStore((s) => s.patients);
  const isLoading = usePatientsStore((s) => s.isLoading);
  const isLoadingMore = usePatientsStore((s) => s.isLoadingMore);
  const hasMore = usePatientsStore((s) => s.hasMore);
  const error = usePatientsStore((s) => s.error);
  const totalLoadedCount = usePatientsStore((s) => s.totalLoadedCount);
  const loadPatients = usePatientsStore((s) => s.loadPatients);
  const loadNextPatientsPage = usePatientsStore((s) => s.loadNextPatientsPage);

  const { searchInput, setSearchInput } = usePatientsSearch();
  const { loadMoreRef } = useInfiniteScroll(
    hasMore,
    isLoadingMore,
    loadNextPatientsPage,
  );

  const showContent = !isLoading && !error;

  // Filtrado local por status
  const filteredPatients = patients.filter((p) => {
    if (statusFilter === 'all') return true;
    const patientStatus = p.status || 'active';
    return patientStatus === statusFilter;
  });

  // El sentinel de infinite scroll y la grilla dependen de patients (sin filtrar)
  const hasAnyPatients = patients.length > 0;
  const hasFilteredResults = filteredPatients.length > 0;

  // Contador principal: métrica de total de pacientes que existen
  const counterText = totalLoadedCount === 1
    ? '1 paciente en total'
    : `${totalLoadedCount} pacientes en total`;
  const sectionCounter = showContent && hasAnyPatients ? counterText : undefined;

  // Buscador + filtros
  const sectionActions = showContent ? (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Buscar por nombre o descripción"
      />
      <div className="flex rounded-lg border border-slate-200 bg-white p-0.5" role="group" aria-label="Filtrar por estado">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === opt.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
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
      {showContent && !hasAnyPatients && (
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

      {/* Éxito: grilla — el sentinel usa hasAnyPatients para no romperse con filtros */}
      {showContent && hasAnyPatients && (
        <>
          {hasFilteredResults ? (
            <PatientCardsGrid patients={filteredPatients} isLoading={false} />
          ) : (
            <EmptyState
              icon="search"
              title={`No hay pacientes ${statusFilter === 'active' ? 'activos' : 'inactivos'}`}
              description="Probá cambiando el filtro para ver otros pacientes"
              variant="compact"
            />
          )}

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
