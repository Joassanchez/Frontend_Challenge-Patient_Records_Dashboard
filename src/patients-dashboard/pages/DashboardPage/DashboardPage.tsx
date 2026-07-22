import { DashboardLayout } from '@/patients-dashboard/organisms';
import PatientModal from '@/patients-dashboard/organisms/PatientModal';
import { useModalStore } from '@/patients-dashboard/store/modal.store';
import { ErrorBoundary } from '@/shared/errors';
import DashboardHeader from '../dashboard/DashboardHeader';
import DashboardSections from '../dashboard/DashboardSections';

export default function DashboardPage() {
  const openCreateModal = useModalStore((s) => s.openCreateModal);

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <DashboardHeader onCreatePatient={openCreateModal} />
        <DashboardSections className="mt-8" />

        <PatientModal />
      </DashboardLayout>
    </ErrorBoundary>
  );
}
