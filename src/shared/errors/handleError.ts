// ---------------------------------------------------------------------------
// handleError — función pura de manejo centralizado de errores
// ---------------------------------------------------------------------------

import { isApiError } from '@/api/types';
import { getErrorMessage, type ErrorContext } from './errorMessages';

/**
 * Modo de visualización del error.
 * - 'inline': retorna el mensaje para que el caller lo muestre en la UI.
 * - 'toast': delega la visualización al callback showToast inyectado.
 * - 'silent': solo registra en consola, sin retorno ni efecto visible.
 */
export type DisplayMode = 'inline' | 'toast' | 'silent';

/**
 * Opciones de configuración para handleError.
 */
export interface HandleErrorOptions {
  /** Cómo se muestra el error al usuario. */
  display: DisplayMode;
  /** Clave de contexto para buscar el mensaje en el diccionario. */
  context: ErrorContext;
  /**
   * Callback para mostrar el error como toast.
   * Obligatorio cuando display === 'toast'. El caller lo provee desde el store.
   */
  showToast?: (message: string) => void;
}

/**
 * Función pura de manejo centralizado de errores.
 *
 * Proceso:
 * 1. Coerza valores no-Error a Error.
 * 2. Registra en console.error con metadata de contexto.
 * 3. Extrae el mensaje: si es ApiError usa su message; si no, usa getErrorMessage.
 * 4. Ruta el resultado según el modo de visualización.
 *
 * @returns El mensaje de error (inline) o undefined (toast/silent).
 */
export function handleError(
  error: unknown,
  options: HandleErrorOptions,
): string | undefined {
  // 1. Verificar si es ApiError (chequeo estructural)
  const isApi = isApiError(error);

  // 2. Coerzar a Error si no lo es
  let coerced: Error;
  if (error instanceof Error) {
    coerced = error;
  } else if (isApi) {
    // ApiError estructural pero no instancia de Error — crear Error con su message
    coerced = new Error((error as { message: string }).message);
  } else {
    coerced = new Error(String(error ?? 'Unknown error'));
  }

  // 3. Registrar con metadata de contexto
  const logPayload: Record<string, unknown> = {
    context: options.context,
    message: coerced.message,
  };

  if (isApi) {
    logPayload.code = (error as { code: string }).code;
    logPayload.status = (error as { status: number }).status;
  }

  if (coerced.stack) {
    logPayload.stack = coerced.stack;
  }

  console.error('[handleError]', logPayload);

  // 4. Extraer mensaje amigable
  const message = isApi
    ? (error as { message: string }).message
    : getErrorMessage(options.context);

  // 5. Ruta según modo de visualización
  switch (options.display) {
    case 'inline':
      return message;
    case 'toast':
      options.showToast?.(message);
      return undefined;
    case 'silent':
      return undefined;
  }
}
