import { usePatientsStore } from '@/patients-dashboard/store/patients.store';
import { useFavoritesStore, selectFavoritesCount } from '@/patients-dashboard/store/favorites.store';

function DashboardStats() {
  const patients = usePatientsStore((s) => s.patients);
  const favoritesCount = useFavoritesStore(selectFavoritesCount);

  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => (p.status || 'active') === 'active').length;

  return (
    <div className="mb-6 grid grid-cols-3 gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalPatients}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">Activos</p>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activePatients}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">Favoritos</p>
        <p className="text-2xl font-bold text-favorite">{favoritesCount}</p>
      </div>
    </div>
  );
}

export default DashboardStats;
