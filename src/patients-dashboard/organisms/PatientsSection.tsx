import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import Button from '@/patients-dashboard/atoms/Button';
import { usePatientsStore } from '@/patients-dashboard/store/patients.store';
import EmptyState from '@/patients-dashboard/molecules/EmptyState';
import Spinner from '@/patients-dashboard/atoms/Spinner';
import ErrorMessage from '@/patients-dashboard/molecules/ErrorMessage';
import SearchInput from '@/patients-dashboard/molecules/SearchInput';
import DashboardSection from './DashboardSection';
import PatientCardsGrid from './PatientCardsGrid';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PatientsSectionProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PATIENTS_PAGE_SIZE = 6;

function PatientsSection({ className }: PatientsSectionProps) {
  const headingId = 'patients-section-heading';
  const hasMounted = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Selectors — PatientsSection is the SOLE store-connected component
  const patients = usePatientsStore((s) => s.patients);
  const isLoading = usePatientsStore((s) => s.isLoading);
  const error = usePatientsStore((s) => s.error);
  const loadPatients = usePatientsStore((s) => s.loadPatients);

  // Local search state (no debounce, per spec)
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleBatch, setVisibleBatch] = useState({
    query: '',
    count: PATIENTS_PAGE_SIZE,
  });

  // Derived filtered list — case-insensitive match on name and description
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPatients = useMemo(
    () =>
      normalizedQuery
        ? patients.filter((p) =>
            [p.name, p.description].some((v) =>
              v.toLowerCase().includes(normalizedQuery),
            ),
          )
        : patients,
    [patients, normalizedQuery],
  );

  const showContent = !isLoading && !error;
  const hasPatients = patients.length > 0;
  const hasFilteredResults = filteredPatients.length > 0;
  const visibleCount =
    visibleBatch.query === normalizedQuery
      ? visibleBatch.count
      : PATIENTS_PAGE_SIZE;
  const visiblePatients = filteredPatients.slice(0, visibleCount);
  const hasMorePatients = visibleCount < filteredPatients.length;

  // Counter copy
  const count = filteredPatients.length;
  const counterText =
    count === 1 ? '1 registro encontrado' : `${count} registros encontrados`;
  const sectionCounter = showContent && hasPatients ? counterText : undefined;
  const sectionActions =
    showContent && hasPatients ? (
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Buscar por nombre o descripción"
      />
    ) : undefined;

  const loadMorePatients = useCallback(() => {
    setVisibleBatch((batch) => {
      const currentCount =
        batch.query === normalizedQuery ? batch.count : PATIENTS_PAGE_SIZE;

      return {
        query: normalizedQuery,
        count: Math.min(
          currentCount + PATIENTS_PAGE_SIZE,
          filteredPatients.length,
        ),
      };
    });
  }, [filteredPatients.length, normalizedQuery]);

  // Mount-only fetch: guard ensures exactly-one execution
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      loadPatients();
    }
  }, [loadPatients]);

  useEffect(() => {
    if (!showContent || !hasPatients || !hasMorePatients) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMorePatients();
        }
      },
      { rootMargin: '160px' },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [
    showContent,
    hasPatients,
    hasMorePatients,
    filteredPatients.length,
    loadMorePatients,
  ]);

  return (
    <DashboardSection
      headingId={headingId}
      title="Pacientes"
      counter={sectionCounter}
      actions={sectionActions}
      className={cn('w-full', className)}
    >
      {/* ---- Loading ---- */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {/* ---- Error ---- */}
      {!isLoading && error && (
        <div className="py-8">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* ---- Empty: no patients loaded ---- */}
      {showContent && !hasPatients && (
        <EmptyState
          icon="user"
          title="No hay pacientes cargados"
          description="Creá tu primer paciente para empezar"
        />
      )}

      {/* ---- Filtered empty: patients exist but none match search ---- */}
      {showContent && hasPatients && !hasFilteredResults && (
        <EmptyState
          icon="search"
          title="No hay resultados"
          description={`No se encontraron pacientes para "${searchQuery.trim()}"`}
          variant="compact"
        />
      )}

      {/* ---- Success: responsive grid of PatientCards ---- */}
      {showContent && hasPatients && hasFilteredResults && (
        <>
          <PatientCardsGrid patients={visiblePatients} />

          {hasMorePatients && (
            <div ref={loadMoreRef} className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={loadMorePatients}>
                Cargar más pacientes
              </Button>
            </div>
          )}
        </>
      )}
    </DashboardSection>
  );
}

export default PatientsSection;
