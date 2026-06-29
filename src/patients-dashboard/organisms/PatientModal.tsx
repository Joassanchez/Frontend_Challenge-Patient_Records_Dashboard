import { useMemo } from 'react';
import Modal from '@/patients-dashboard/molecules/Modal';
import PatientForm from '@/patients-dashboard/organisms/PatientForm';
import {
  useModalStore,
  selectIsOpen,
  selectModalMode,
  selectSelectedPatientId,
} from '@/patients-dashboard/store/modal.store';
import {
  usePatientsStore,
  selectPatientById,
} from '@/patients-dashboard/store/patients.store';
import Button from '@/patients-dashboard/atoms/Button';
import type { PatientFormData } from '@/patients-dashboard/schemas/patient.schema';
import type { Patient } from '@/patients-dashboard/types/patient.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toFormDefaults(patient?: Patient): PatientFormData {
  if (!patient) {
    return { name: '', description: '', webpage: '', avatar: '' };
  }
  return {
    name: patient.name,
    description: patient.description,
    webpage: patient.webpage,
    avatar: patient.avatar,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PatientModal() {
  const isOpen = useModalStore(selectIsOpen);
  const mode = useModalStore(selectModalMode);
  const selectedPatientId = useModalStore(selectSelectedPatientId);
  const closeModal = useModalStore((s) => s.closeModal);

  const selectedPatient = usePatientsStore(
    selectPatientById(selectedPatientId),
  );
  const addPatient = usePatientsStore((s) => s.addPatient);
  const updatePatient = usePatientsStore((s) => s.updatePatient);

  // Stabilize defaultValues based on mode and selectedPatientId
  // selectedPatientId changing implies selectedPatient changes too
  const defaultValues = useMemo(
    () => toFormDefaults(mode === 'edit' ? selectedPatient : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, selectedPatientId],
  );

  // ---- Determine title and submit label ----
  const isCreate = mode === 'create';
  const title = isCreate ? 'Nuevo paciente' : 'Editar paciente';
  const submitLabel = isCreate ? 'Crear paciente' : 'Guardar cambios';

  // ---- Handler ----
  function handleSubmit(data: PatientFormData) {
    if (isCreate) {
      addPatient(data);
    } else if (selectedPatient) {
      updatePatient({ ...selectedPatient, ...data });
    }
    closeModal();
  }

  // ---- "Not found" state for edit with unknown patient ----
  const showNotFound = mode === 'edit' && selectedPatientId && !selectedPatient;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={title}
      ariaLabel={title}
    >
      {showNotFound ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-text-muted text-sm">
            Paciente no encontrado
          </p>
          <Button variant="secondary" size="sm" onClick={closeModal}>
            Cerrar
          </Button>
        </div>
      ) : (
        <PatientForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          submitLabel={submitLabel}
        />
      )}
    </Modal>
  );
}

export default PatientModal;
