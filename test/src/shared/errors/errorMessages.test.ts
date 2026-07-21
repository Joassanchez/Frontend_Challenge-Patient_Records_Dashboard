import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  errorMessages,
  type ErrorContext,
} from '@/shared/errors/errorMessages';

// ============================================================================
// errorMessages — diccionario de mensajes
// ============================================================================

describe('errorMessages dictionary', () => {
  it('contains a message for every ErrorContext key', () => {
    const contexts: ErrorContext[] = [
      'load-patients',
      'load-more-patients',
      'favorite-toggle',
      'favorite-load',
      'patient-update',
      'render',
    ];

    for (const ctx of contexts) {
      expect(errorMessages[ctx]).toBeDefined();
      expect(typeof errorMessages[ctx]).toBe('string');
      expect(errorMessages[ctx].length).toBeGreaterThan(0);
    }
  });

  it('contains a default fallback message', () => {
    expect(errorMessages.default).toBeDefined();
    expect(typeof errorMessages.default).toBe('string');
    expect(errorMessages.default.length).toBeGreaterThan(0);
  });

  it('all messages are in Spanish (contain at least one accented character or Spanish word)', () => {
    // Verificación heurística: los mensajes deben estar en español.
    // Verificamos que al menos uno contenga caracteres típicos del español.
    const spanishPattern = /[áéíóúñ¿¡]/i;
    const hasSpanish = Object.values(errorMessages).some((msg) =>
      spanishPattern.test(msg),
    );
    expect(hasSpanish).toBe(true);
  });
});

// ============================================================================
// getErrorMessage — búsqueda con cadena de fallback
// ============================================================================

describe('getErrorMessage', () => {
  it('returns the mapped message for a known context key', () => {
    const message = getErrorMessage('load-patients');
    expect(message).toBe(errorMessages['load-patients']);
    expect(message).toContain('pacientes');
  });

  it('returns a different message for a different known context', () => {
    const loadMsg = getErrorMessage('load-patients');
    const favMsg = getErrorMessage('favorite-toggle');
    expect(loadMsg).not.toBe(favMsg);
    expect(favMsg).toContain('favorito');
  });

  it('returns the default fallback for an unknown context key', () => {
    // Forzamos una clave desconocida casteando a ErrorContext.
    const message = getErrorMessage('unknown-context' as ErrorContext);
    expect(message).toBe(errorMessages.default);
  });

  it('returns a non-empty string for every valid ErrorContext', () => {
    const contexts: ErrorContext[] = [
      'load-patients',
      'load-more-patients',
      'favorite-toggle',
      'favorite-load',
      'patient-update',
      'render',
    ];

    for (const ctx of contexts) {
      const msg = getErrorMessage(ctx);
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  it('never returns undefined or null — always falls back to a string', () => {
    const message = getErrorMessage('totally-invalid' as ErrorContext);
    expect(message).toBeDefined();
    expect(message).not.toBeNull();
    expect(typeof message).toBe('string');
  });
});
