import { useState, useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { usePatientsStore, type SortBy } from '@/patients-dashboard/store/patients.store';
import EmptyState from '@/patients-dashboard/molecules/EmptyState';
import ErrorMessage from '@/patients-dashboard/molecules/ErrorMessage';
import SearchInput from '@/patients-dashboard/molecules/SearchInput';
import Spinner from '@/patients-dashboard/atoms/Spinner';
import Button from '@/patients-dashboard/atoms/Button';
import DashboardSection from '../DashboardSection';
import PatientCardsGrid from '../PatientCardsGrid';
import Banner from '../Banner';
import { usePatientsSearch } from './usePatientsSearch';
import { useInfiniteScroll } from './useInfiniteScroll';

type StatusFilter = 'all' | 'active' | 'inactive';

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'name', label: 'Nombre' },
  { value: 'date', label: 'Fecha' },
  { value: 'status', label: 'Estado' },
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
  const sortBy = usePatientsStore((s) => s.sortBy);
  const loadPatients = usePatientsStore((s) => s.loadPatients);
  const loadNextPatientsPage = usePatientsStore((s) => s.loadNextPatientsPage);
  const setSortBy = usePatientsStore((s) => s.setSortBy);

  const { searchInput, setSearchInput } = usePatientsSearch();
  const { loadMoreRef } = useInfiniteScroll(
    hasMore,
    isLoadingMore,
    loadNextPatientsPage,
  );

  // Filtrado local por status, luego ordenamiento
  const filteredAndSortedPatients = useMemo(() => {
    const filtered = patients.filter((p) => {
      if (statusFilter === 'all') return true;
      const patientStatus = p.status || 'active';
      return patientStatus === statusFilter;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
        case 'status': {
          const statusA = a.status || 'active';
          const statusB = b.status || 'active';
          return statusA.localeCompare(statusB);
        }
        default:
          return 0;
      }
    });
  }, [patients, statusFilter, sortBy]);

  const hasAnyPatients = patients.length > 0;
  const hasFilteredResults = filteredAndSortedPatients.length > 0;

  // Error resilience: show stale data + banner when error with cached patients
  const showErrorOnly = !isLoading && error && !hasAnyPatients;
  const showStaleBanner = error && hasAnyPatients;

  // Contador principal: métrica de total de pacientes que existen
  const counterText = totalLoadedCount === 1
    ? '1 paciente en total'
    : `${totalLoadedCount} pacientes en total`;
  const sectionCounter = hasAnyPatients ? counterText : undefined;

  // Buscador + filtros + sort — show in all states except error-only (no patients)
  const sectionActions = !showErrorOnly ? (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Buscar por nombre o descripción"
      />
      <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-600 dark:bg-slate-800" role="group" aria-label="Filtrar por estado">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === opt.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortBy)}
        aria-label="Ordenar por"
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
      {/* ---- Stale banner: error but cached data visible ---- */}
      {showStaleBanner && <Banner isStale />}

      {/* ---- Error only: no cached data ---- */}
      {showErrorOnly && (
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

      {/* ---- Cold loading: skeleton when no data yet ---- */}
      {isLoading && !hasAnyPatients && (
        <PatientCardsGrid patients={[]} isLoading />
      )}

      {/* Vacío: sin pacientes y sin error y sin loading */}
      {!isLoading && !error && !hasAnyPatients && (
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

      {/* Éxito: grilla — el sentinel solo se muestra si hay resultados visibles */}
      {hasAnyPatients && !showErrorOnly && (
        <>
          {hasFilteredResults ? (
            <PatientCardsGrid patients={filteredAndSortedPatients} isLoading={false} />
          ) : (
            <EmptyState
              icon="search"
              title={`No hay pacientes ${statusFilter === 'active' ? 'activos' : 'inactivos'}`}
              description="Probá cambiando el filtro para ver otros pacientes"
              variant="compact"
            />
          )}

          <div ref={loadMoreRef} className={cn('mt-5 flex justify-center', !hasFilteredResults && 'hidden')}>
            {isLoadingMore && <Spinner size="md" color="primary" />}
          </div>
        </>
      )}
    </DashboardSection>
  );
}

export default PatientsSection;
