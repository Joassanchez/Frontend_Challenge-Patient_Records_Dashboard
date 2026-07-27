import Button from '@/patients-dashboard/atoms/Button';
import Icon from '@/patients-dashboard/atoms/Icon';
import { useToastStore } from '@/patients-dashboard/store/toast.store';

interface DashboardHeaderProps {
  onCreatePatient: () => void;
  isOffline?: boolean;
}

export default function DashboardHeader({ onCreatePatient, isOffline }: DashboardHeaderProps) {
  const showInfo = useToastStore((s) => s.showInfo);

  function handleClick() {
    if (isOffline) {
      showInfo('No disponible sin conexión');
      return;
    }
    onCreatePatient();
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
          Tus pacientes
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gestión de historias clínicas
        </p>
      </div>
      <Button
        variant="primary"
        className="w-full rounded-lg px-4 shadow-primary/25 sm:w-auto"
        onClick={handleClick}
      >
        <Icon name="plus" size="sm" />
        Nuevo paciente
      </Button>
    </div>
  );
}
