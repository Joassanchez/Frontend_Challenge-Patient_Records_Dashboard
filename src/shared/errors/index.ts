// ---------------------------------------------------------------------------
// Barrel — re-exporta todos los módulos de manejo de errores
// ---------------------------------------------------------------------------

export { errorMessages, getErrorMessage, type ErrorContext } from './errorMessages';
export {
  handleError,
  type DisplayMode,
  type HandleErrorOptions,
} from './handleError';
export { default as ErrorBoundary } from './ErrorBoundary';
