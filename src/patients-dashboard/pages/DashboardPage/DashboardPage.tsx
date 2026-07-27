import { useCallback, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/patients-dashboard/organisms';
import PatientModal from '@/patients-dashboard/organisms/PatientModal';
import FavoritesSection from '@/patients-dashboard/organisms/FavoritesSection';
import PatientsSection from '@/patients-dashboard/organisms/PatientsSection';
import Banner from '@/patients-dashboard/organisms/Banner';
import DashboardStats from '@/patients-dashboard/organisms/DashboardStats';
import { useModalStore } from '@/patients-dashboard/store/modal.store';
import { useUiStore } from '@/patients-dashboard/store/ui.store';
import { cn } from '@/shared/utils/cn';
import { ErrorBoundary } from '@/shared/errors';
import { useTheme } from '@/shared/theme/useTheme';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { useKeyboardShortcuts } from '@/shared/hooks/useKeyboardShortcuts';
import DashboardHeader from '../dashboard/DashboardHeader';

export default function DashboardPage() {
  const openCreateModal = useModalStore((s) => s.openCreateModal);
  const closeModal = useModalStore((s) => s.closeModal);
  const isModalOpen = useModalStore((s) => s.isOpen);
  const isOnline = useUiStore((s) => s.isOnline);

  // Initialize theme + online status
  useTheme();
  useOnlineStatus();

  // Keyboard shortcuts
  const shortcuts = useMemo(() => ({
    n: () => {
      // Ctrl+N handled separately with preventDefault
    },
    '/': () => {
      const searchInput = document.getElementById('patient-search') as HTMLInputElement | null;
      searchInput?.focus();
    },
    escape: () => {
      if (isModalOpen) {
        closeModal();
      } else {
        const searchInput = document.getElementById('patient-search') as HTMLInputElement | null;
        if (searchInput && document.activeElement === searchInput) {
          if (searchInput.value) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
          searchInput.blur();
        }
      }
    },
  }), [isModalOpen, closeModal]);

  useKeyboardShortcuts(shortcuts);

  // Ctrl+N handler (needs preventDefault)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      openCreateModal();
    }
  }, [openCreateModal]);

  // Register Ctrl+N globally
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <ErrorBoundary>
      <DashboardLayout>
        {!isOnline && <Banner isOffline />}
        <DashboardStats />
        <DashboardHeader onCreatePatient={openCreateModal} isOffline={!isOnline} />
        <div className={cn('flex flex-col gap-8', 'mt-8')}>
          <FavoritesSection />
          <ErrorBoundary fallback={<Banner message="Error al cargar los pacientes. Intentá de nuevo." />}>
            <PatientsSection />
          </ErrorBoundary>
        </div>
        <PatientModal />
      </DashboardLayout>
    </ErrorBoundary>
  );
}
