import { cn } from '@/shared/utils/cn';
import EmptyState from '@/patients-dashboard/molecules/EmptyState';

interface PatientsSectionProps {
  className?: string;
}

function PatientsSection({ className }: PatientsSectionProps) {
  const headingId = 'patients-section-heading';

  return (
    <section
      aria-labelledby={headingId}
      className={cn('w-full', className)}
    >
      <h2 id={headingId} className="text-lg font-semibold text-slate-800 mb-4">
        Pacientes
      </h2>
      <EmptyState
        icon="user"
        title="No hay pacientes cargados"
        description="Creá tu primer paciente para empezar"
      />
    </section>
  );
}

export default PatientsSection;
