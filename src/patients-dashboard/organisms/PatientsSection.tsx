import { useEffect, useRef } from 'react';
import { cn } from '@/shared/utils/cn';
import { usePatientsStore } from '@/patients-dashboard/store/patients.store';
import EmptyState from '@/patients-dashboard/molecules/EmptyState';
import Spinner from '@/patients-dashboard/atoms/Spinner';
import ErrorMessage from '@/patients-dashboard/molecules/ErrorMessage';
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
      <h2 id={headingId} className="text-lg font-semibold text-slate-800 mb-4">
        Pacientes
      </h2>

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

      {/* ---- Empty ---- */}
      {!isLoading && !error && patients.length === 0 && (
        <EmptyState
          icon="user"
          title="No hay pacientes cargados"
          description="Creá tu primer paciente para empezar"
        />
      )}

      {/* ---- Success: responsive grid of PatientCards ---- */}
      {!isLoading && !error && patients.length > 0 && (
        <div
          className={cn(
            'grid gap-4',
            'grid-cols-1',
            'md:grid-cols-2',
            'lg:grid-cols-3',
          )}
        >
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PatientsSection;
