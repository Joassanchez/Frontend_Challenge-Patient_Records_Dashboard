import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { usePatientsStore } from '@/patients-dashboard/store/patients.store';
import EmptyState from '@/patients-dashboard/molecules/EmptyState';
import Spinner from '@/patients-dashboard/atoms/Spinner';
import ErrorMessage from '@/patients-dashboard/molecules/ErrorMessage';
import SearchInput from '@/patients-dashboard/molecules/SearchInput';
import PatientCard from './PatientCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PatientsSectionProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PatientsSection({ className }: PatientsSectionProps) {
  const headingId = 'patients-section-heading';
  const hasMounted = useRef(false);

  // Selectors — PatientsSection is the SOLE store-connected component
  const patients = usePatientsStore((s) => s.patients);
  const isLoading = usePatientsStore((s) => s.isLoading);
  const error = usePatientsStore((s) => s.error);
  const loadPatients = usePatientsStore((s) => s.loadPatients);

  // Local search state (no debounce, per spec)
  const [searchQuery, setSearchQuery] = useState('');

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

  // Counter copy
  const count = filteredPatients.length;
  const counterText =
    count === 1 ? '1 registro encontrado' : `${count} registros encontrados`;

  // Mount-only fetch: guard ensures exactly-one execution
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      loadPatients();
    }
  }, [loadPatients]);

  return (
    <section
      aria-labelledby={headingId}
      className={cn('w-full', className)}
    >
      {/* ---- Header row: heading + counter + search ---- */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2">
          <h2
            id={headingId}
            className="text-lg font-semibold text-slate-800"
          >
            Pacientes
          </h2>
          {showContent && hasPatients && (
            <span className="text-sm text-text-muted">{counterText}</span>
          )}
        </div>
        {showContent && hasPatients && (
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nombre o descripción"
          />
        )}
      </div>

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
        <div
          className={cn(
            'grid gap-4',
            'grid-cols-1',
            'md:grid-cols-2',
            'lg:grid-cols-3',
          )}
        >
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PatientsSection;
