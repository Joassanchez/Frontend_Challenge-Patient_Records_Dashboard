import { create } from 'zustand';
import { generateId } from '@/shared/utils/id';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  createdAt: number;
}

export interface ToastState {
  toasts: ToastMessage[];
}

export interface ToastActions {
  showToast: (input: {
    type: ToastMessage['type'];
    message: string;
    duration?: number;
  }) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  resetStore: () => void;
}

export type ToastStore = ToastState & ToastActions;

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------

export const initialState: ToastState = {
  toasts: [],
};

// ---------------------------------------------------------------------------
// Duraciones por defecto
// ---------------------------------------------------------------------------

const DEFAULT_DURATION_SUCCESS = 4000;
const DEFAULT_DURATION_ERROR = 6000;
const DEFAULT_DURATION_INFO = 4000;
const DEFAULT_DURATION_WARNING = 4000;

function resolveDuration(
  type: ToastMessage['type'],
  explicit?: number,
): number {
  if (explicit !== undefined) return explicit;
  switch (type) {
    case 'error':
      return DEFAULT_DURATION_ERROR;
    case 'success':
      return DEFAULT_DURATION_SUCCESS;
    case 'info':
      return DEFAULT_DURATION_INFO;
    case 'warning':
      return DEFAULT_DURATION_WARNING;
  }
}

// ---------------------------------------------------------------------------
// Gestión de temporizadores (ámbito del módulo, privado al store)
// ---------------------------------------------------------------------------

const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearTimer(id: string): void {
  const timer = toastTimers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    toastTimers.delete(id);
  }
}

function clearAllTimers(): void {
  for (const [, timer] of toastTimers) {
    clearTimeout(timer);
  }
  toastTimers.clear();
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useToastStore = create<ToastStore>()((set, get) => ({
  // --- Estado ---
  ...initialState,

  // --- Acciones ---

  showToast: (input) => {
    const toast: ToastMessage = {
      id: generateId(),
      type: input.type,
      message: input.message,
      duration: input.duration,
      createdAt: Date.now(),
    };

    const { toasts } = get();

    // Evicción FIFO: si se alcanza la capacidad máxima (3), elimina el más antiguo
    let nextToasts: ToastMessage[];
    if (toasts.length >= 3) {
      const [oldest] = toasts;
      clearTimer(oldest.id);
      nextToasts = [...toasts.slice(1), toast];
    } else {
      nextToasts = [...toasts, toast];
    }

    set({ toasts: nextToasts });

    // Programar cierre automático
    const duration = resolveDuration(toast.type, input.duration);
    const timer = setTimeout(() => {
      // Usa dismiss interno — limpia el mapa de timers y filtra del estado
      clearTimer(toast.id);
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== toast.id),
      }));
    }, duration);
    toastTimers.set(toast.id, timer);
  },

  showSuccess: (message, duration) => {
    get().showToast({ type: 'success', message, duration });
  },

  showError: (message, duration) => {
    get().showToast({ type: 'error', message, duration });
  },

  showInfo: (message, duration) => {
    get().showToast({ type: 'info', message, duration });
  },

  showWarning: (message, duration) => {
    get().showToast({ type: 'warning', message, duration });
  },

  dismissToast: (id) => {
    clearTimer(id);
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    clearAllTimers();
    set({ toasts: [] });
  },

  resetStore: () => {
    clearAllTimers();
    set(initialState);
  },
}));

// ---------------------------------------------------------------------------
// Selectores (funciones puras fuera del store)
// ---------------------------------------------------------------------------

export function selectToasts(state: ToastState): ToastMessage[] {
  return state.toasts;
}
