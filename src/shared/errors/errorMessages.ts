// ---------------------------------------------------------------------------
// Diccionario de mensajes de error — claves de contexto a mensajes en español
// ---------------------------------------------------------------------------

/**
 * Claves de contexto para identificar el origen de un error.
 * Cada clave representa un escenario específico donde puede ocurrir un fallo.
 */
export type ErrorContext =
  | 'load-patients'
  | 'load-more-patients'
  | 'favorite-toggle'
  | 'favorite-load'
  | 'patient-update'
  | 'render';

/**
 * Diccionario inmutable de mensajes de error amigables para el usuario.
 * Cada clave de contexto mapea a un mensaje descriptivo en español.
 */
export const errorMessages: Record<ErrorContext | 'default', string> = {
  'load-patients': 'No se pudieron cargar los pacientes. Intentá de nuevo.',
  'load-more-patients':
    'No se pudieron cargar más pacientes. Intentá de nuevo.',
  'favorite-toggle':
    'No se pudo actualizar el estado de favorito. Intentá de nuevo.',
  'favorite-load':
    'No se pudieron cargar los favoritos. Se usará la lista vacía.',
  'patient-update': 'No se pudo actualizar el paciente. Intentá de nuevo.',
  render: 'Ocurrió un error inesperado al renderizar la página.',
  default: 'Ha ocurrido un error inesperado.',
};

/**
 * Obtiene el mensaje de error para un contexto dado.
 *
 * Cadena de fallback de 3 pasos:
 * 1. Busca el mensaje específico para el contexto en el diccionario.
 * 2. Si no existe, usa el mensaje por defecto (`default`).
 * 3. Como último recurso, retorna un mensaje genérico hardcodeado.
 */
export function getErrorMessage(context: ErrorContext): string {
  return (
    errorMessages[context] ??
    errorMessages.default ??
    'Ha ocurrido un error inesperado.'
  );
}
