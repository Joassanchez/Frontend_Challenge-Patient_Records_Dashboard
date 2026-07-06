import { cn } from '@/shared/utils/cn';
import FavoritesSection from '@/patients-dashboard/organisms/FavoritesSection';
import PatientsSection from '@/patients-dashboard/organisms/PatientsSection';

interface DashboardSectionsProps {
  className?: string;
}

export default function DashboardSections({ className }: DashboardSectionsProps) {
  return (
    <div className={cn('flex flex-col gap-8', className)}>
      <FavoritesSection />
      <PatientsSection />
    </div>
  );
}
