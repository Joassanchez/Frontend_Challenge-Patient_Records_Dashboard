import Button from '@/patients-dashboard/atoms/Button';
import Icon from '@/patients-dashboard/atoms/Icon';

interface DashboardHeaderProps {
  onCreatePatient: () => void;
}

export default function DashboardHeader({ onCreatePatient }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Tus pacientes
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Gestión de historias clínicas
        </p>
      </div>
      <Button
        variant="primary"
        className="w-full sm:w-auto"
        onClick={onCreatePatient}
      >
        <Icon name="plus" size="sm" />
        Nuevo paciente
      </Button>
    </div>
  );
}
