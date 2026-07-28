import Button from '@/patients-dashboard/atoms/Button';
import Icon from '@/patients-dashboard/atoms/Icon';
import { cn } from '@/shared/utils/cn';

interface DashboardHeaderProps {
  onCreatePatient: () => void;
  isOffline?: boolean;
}

export default function DashboardHeader({ onCreatePatient, isOffline }: DashboardHeaderProps) {
  function handleClick() {
    if (isOffline) return;
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
        className={cn(
          'w-full rounded-lg px-4 shadow-primary/25 sm:w-auto',
          isOffline && 'opacity-50 cursor-not-allowed',
        )}
        onClick={handleClick}
        aria-disabled={isOffline || undefined}
      >
        <Icon name="plus" size="sm" />
        Nuevo paciente
      </Button>
    </div>
  );
}
