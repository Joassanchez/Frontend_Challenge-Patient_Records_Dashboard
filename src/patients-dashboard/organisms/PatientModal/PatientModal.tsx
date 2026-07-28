import { useMemo, useRef, useState } from 'react';
import Modal from '@/patients-dashboard/molecules/Modal';
import PatientForm from '@/patients-dashboard/organisms/PatientForm';
import { useModalStore, selectIsOpen, selectModalMode, selectSelectedPatientId, } from '@/patients-dashboard/store/modal.store';
import { usePatientsStore, selectPatientById, } from '@/patients-dashboard/store/patients.store';
import { useToastStore } from '@/patients-dashboard/store/toast.store';
import { handleError } from '@/shared/errors';
import Button from '@/patients-dashboard/atoms/Button';
import type { PatientFormData } from '@/patients-dashboard/schemas/patient.schema';
import type { Patient } from '@/patients-dashboard/types/patient.types';

function toFormDefaults(patient?: Patient): PatientFormData {
  if (!patient) {
    return { name: '', description: '', website: '', avatar: '' };
  }
  return {
    name: patient.name,
    description: patient.description,
    website: patient.website,
    avatar: patient.avatar,
  };
}

function PatientModal() {
  const isOpen = useModalStore(selectIsOpen);
  const mode = useModalStore(selectModalMode);
  const selectedPatientId = useModalStore(selectSelectedPatientId);
  const closeModal = useModalStore((s) => s.closeModal);

  const selectedPatient = usePatientsStore(selectPatientById(selectedPatientId),);
  const addPatient = usePatientsStore((s) => s.addPatient);
  const updatePatient = usePatientsStore((s) => s.updatePatient);
  const showSuccess = useToastStore((s) => s.showSuccess);
  const showError = useToastStore((s) => s.showError);

  // Ref mutable para trackear isDirty sin re-render cascade
  const isDirtyRef = useRef(false);

  // Estado del diálogo de confirmación de descarte
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  // Estabiliza defaultValues según el modo y selectedPatient.
  // selectedPatient captura cambios de selectedPatientId transitivamente,
  // manteniendo limpia la lista de dependencias para ESLint exhaustive-deps.
  const defaultValues = useMemo(
    () => toFormDefaults(mode === 'edit' ? selectedPatient : undefined),
    [mode, selectedPatient],
  );

  // ---- Determinar título y etiqueta del botón ----
  const isCreate = mode === 'create';
  const title = isCreate ? 'Nuevo paciente' : 'Editar paciente';
  const submitLabel = isCreate ? 'Crear paciente' : 'Guardar cambios';

  // ---- Dirty gate: consulta isDirty vía ref mutable (sin re-render cascade) ----
  function handleClose() {
    if (isDirtyRef.current && !confirmDiscardOpen) {
      setConfirmDiscardOpen(true);
      return;
    }
    // Clean form, or user confirmed discard
    setConfirmDiscardOpen(false);
    closeModal();
  }

  function handleSubmit(data: PatientFormData) {
    if (isCreate) {
      addPatient(data);
      showSuccess('Paciente creado correctamente');
      closeModal();
    } else if (selectedPatient) {
      const updated = updatePatient(selectedPatient.id, data);
      if (updated) {
        showSuccess('Cambios guardados');
        closeModal();
      } else {
        handleError(new Error('update failed'), {
          display: 'toast',
          context: 'patient-update',
          showToast: showError,
        });
      }
    }
  }

  // ---- Estado "no encontrado" para edición con paciente desconocido ----
  const showNotFound = mode === 'edit' && selectedPatientId && !selectedPatient;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={confirmDiscardOpen ? 'Cambios sin guardar' : title}
      ariaLabel={confirmDiscardOpen ? 'Confirmar descarte de cambios' : title}
    >
      {showNotFound ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-text-muted text-sm">
            Paciente no encontrado
          </p>
          <Button variant="secondary" size="sm" onClick={handleClose} data-testid="close-button">
            Cerrar
          </Button>
        </div>
      ) : confirmDiscardOpen ? (
        <div className="flex flex-col items-center gap-4 py-4" role="alertdialog" aria-label="Confirmar descarte de cambios">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tenés cambios sin guardar. ¿Querés descartarlos?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setConfirmDiscardOpen(false);
                closeModal();
              }}
            >
              Descartar cambios
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setConfirmDiscardOpen(false)}
            >
              Seguir editando
            </Button>
          </div>
        </div>
      ) : (
        <>
          <PatientForm
            dirtyRef={isDirtyRef}
            mode={mode}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            submitLabel={submitLabel}
          />
        </>
      )}
    </Modal>
  );
}

export default PatientModal;
