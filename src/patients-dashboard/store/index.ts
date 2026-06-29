export {
  usePatientsStore,
  selectPatients,
  selectPatientById,
  selectPatientsLoading,
  selectPatientsError,
  initialState,
} from './patients.store';

export type { PatientsState, PatientsActions, PatientsStore } from './patients.store';

export {
  useFavoritesStore,
  selectFavoriteIds,
  selectIsFavorite,
  selectFavoritesCount,
} from './favorites.store';

export type { FavoritesState } from './favorites.store';
