import { usePatientsStore } from '@/patients-dashboard/store/patients.store';
import { useFavoritesStore, selectFavoritesCount } from '@/patients-dashboard/store/favorites.store';
import { useCountUp } from './useCountUp';

function DashboardStats() {
  const patients = usePatientsStore((s) => s.patients);
  const favoritesCount = useFavoritesStore(selectFavoritesCount);

  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => (p.status || 'active') === 'active').length;

  const animatedTotal = useCountUp(totalPatients);
  const animatedActive = useCountUp(activePatients);
  const animatedFavorites = useCountUp(favoritesCount);

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{animatedTotal}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">Activos</p>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{animatedActive}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">Favoritos</p>
        <p className="text-2xl font-bold text-favorite">{animatedFavorites}</p>
      </div>
    </div>
  );
}

export default DashboardStats;
