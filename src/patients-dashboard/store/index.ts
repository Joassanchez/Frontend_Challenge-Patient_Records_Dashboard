export {
  usePatientsStore,
  selectPatients,
  selectPatientById,
  selectPatientsLoading,
  selectPatientsError,
  initialState,
} from './patients.store';

export type { PatientsState, PatientsActions, PatientsStore } from './patients.store';
