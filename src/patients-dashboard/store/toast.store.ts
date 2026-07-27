import { create } from 'zustand';
import { generateId } from '@/shared/utils/id';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  createdAt: number;
  action?: ToastAction;
}

export interface ToastState {
  toasts: ToastMessage[];
}

export interface ToastShowOptions {
  duration?: number;
  action?: ToastAction;
}

export interface ToastActions {
  showToast: (input: {
    type: ToastMessage['type'];
    message: string;
    duration?: number;
    action?: ToastAction;
  }) => void;
  showSuccess: (message: string, options?: ToastShowOptions | number) => void;
  showError: (message: string, options?: ToastShowOptions | number) => void;
  showInfo: (message: string, options?: ToastShowOptions | number) => void;
  showWarning: (message: string, options?: ToastShowOptions | number) => void;
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
// Helper: normalizar opciones (backward compat con duration como number)
// ---------------------------------------------------------------------------

function normalizeOptions(
  options?: ToastShowOptions | number,
): ToastShowOptions | undefined {
  if (options === undefined || options === null) return undefined;
  if (typeof options === 'number') return { duration: options };
  return options;
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
      action: input.action,
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

  showSuccess: (message, options) => {
    const opts = normalizeOptions(options);
    get().showToast({ type: 'success', message, duration: opts?.duration, action: opts?.action });
  },

  showError: (message, options) => {
    const opts = normalizeOptions(options);
    get().showToast({ type: 'error', message, duration: opts?.duration, action: opts?.action });
  },

  showInfo: (message, options) => {
    const opts = normalizeOptions(options);
    get().showToast({ type: 'info', message, duration: opts?.duration, action: opts?.action });
  },

  showWarning: (message, options) => {
    const opts = normalizeOptions(options);
    get().showToast({ type: 'warning', message, duration: opts?.duration, action: opts?.action });
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
