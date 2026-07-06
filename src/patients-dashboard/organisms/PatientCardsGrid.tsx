import { cn } from '@/shared/utils/cn';
import type { Patient } from '@/patients-dashboard/types';
import PatientCard from './PatientCard';

interface PatientCardsGridProps {
  patients: Patient[];
}

function PatientCardsGrid({ patients }: PatientCardsGridProps) {
  return (
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
  );
}

export default PatientCardsGrid;
