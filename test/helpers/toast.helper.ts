import type { ToastMessage } from '@/patients-dashboard/store/toast.store';

const defaults = {
  id: 'toast-1',
  type: 'success' as const,
  message: 'Test message',
};

export function makeToast(overrides?: Partial<ToastMessage>): ToastMessage {
  return { ...defaults, createdAt: Date.now(), ...overrides };
}
