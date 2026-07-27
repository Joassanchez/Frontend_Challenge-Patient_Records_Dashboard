import { useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
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
  const updatePatientStatus = usePatientsStore((s) => s.updatePatientStatus);
  const showSuccess = useToastStore((s) => s.showSuccess);
  const showError = useToastStore((s) => s.showError);

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

  // ---- Estado actual del paciente para el toggle ----
  const patientStatus: 'active' | 'inactive' = selectedPatient?.status || 'active';
  const isActive = patientStatus === 'active';

  function handleStatusToggle() {
    if (!selectedPatient) return;
    const nextStatus = isActive ? 'inactive' : 'active';
    updatePatientStatus(selectedPatient.id, nextStatus);
    showSuccess(nextStatus === 'active' ? 'Paciente activado' : 'Paciente inactivado');
  }

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
          <Button variant="secondary" size="sm" onClick={closeModal} data-testid="close-button">
            Cerrar
          </Button>
        </div>
      ) : (
        <>
          {/* ---- Toggle Activo/Inactivo (solo edición) ---- */}
          {mode === 'edit' && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 mb-5">
              <span className="text-sm font-medium text-slate-700">Estado</span>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                aria-label={isActive ? 'Desactivar paciente' : 'Activar paciente'}
                onClick={handleStatusToggle}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  isActive ? 'bg-emerald-500' : 'bg-slate-300',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200',
                    isActive ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>
          )}

          <PatientForm
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
