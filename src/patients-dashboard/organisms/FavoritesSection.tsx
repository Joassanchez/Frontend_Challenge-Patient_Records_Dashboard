import { cn } from '@/shared/utils/cn';
import EmptyState from '@/patients-dashboard/molecules/EmptyState';

interface FavoritesSectionProps {
  className?: string;
}

function FavoritesSection({ className }: FavoritesSectionProps) {
  const headingId = 'favorites-section-heading';

  return (
    <section
      aria-labelledby={headingId}
      className={cn('w-full', className)}
    >
      <h2 id={headingId} className="text-lg font-semibold text-slate-800 mb-4">
        Favoritos
      </h2>
      <EmptyState
        icon="inbox"
        title="No tenés favoritos aún"
        description="Marcá pacientes como favoritos para verlos acá"
      />
    </section>
  );
}

export default FavoritesSection;
