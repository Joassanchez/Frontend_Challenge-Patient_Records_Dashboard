import { DashboardLayout } from '@/patients-dashboard/organisms';
import PatientModal from '@/patients-dashboard/organisms/PatientModal';
import FavoritesSection from '@/patients-dashboard/organisms/FavoritesSection';
import PatientsSection from '@/patients-dashboard/organisms/PatientsSection';
import { useModalStore } from '@/patients-dashboard/store/modal.store';
import { cn } from '@/shared/utils/cn';
import { ErrorBoundary } from '@/shared/errors';
import DashboardHeader from '../dashboard/DashboardHeader';

export default function DashboardPage() {
  const openCreateModal = useModalStore((s) => s.openCreateModal);

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <DashboardHeader onCreatePatient={openCreateModal} />
        <div className={cn('flex flex-col gap-8', 'mt-8')}>
          <FavoritesSection />
          <PatientsSection />
        </div>
        <PatientModal />
      </DashboardLayout>
    </ErrorBoundary>
  );
}
