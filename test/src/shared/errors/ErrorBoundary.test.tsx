import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '@/shared/errors/ErrorBoundary';

// ============================================================================
// Setup — spies
// ============================================================================

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

// ============================================================================
// Componente que lanza un error durante el render
// ============================================================================

function Thrower({ message = 'Test error' }: { message?: string }) {
  throw new Error(message);
}

function SafeChild() {
  return <div data-testid="safe-child">Safe content</div>;
}

// ============================================================================
// Escenario 1: Child throws → catches
// ============================================================================

describe('ErrorBoundary — catches child errors', () => {
  it('catches errors thrown during render and logs to console.error', () => {
    render(
      <ErrorBoundary>
        <Thrower message="Something broke" />
      </ErrorBoundary>,
    );

    // console.error es llamado por React y por el ErrorBoundary
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('does not crash the entire app when a child throws', () => {
    // Si el ErrorBoundary funciona, no se propaga la excepción
    expect(() =>
      render(
        <ErrorBoundary>
          <Thrower />
        </ErrorBoundary>,
      ),
    ).not.toThrow();
  });
});

// ============================================================================
// Escenario 2: Fallback UI renders
// ============================================================================

describe('ErrorBoundary — fallback UI', () => {
  it('renders friendly fallback UI (not raw error) when child throws', () => {
    render(
      <ErrorBoundary>
        <Thrower message="Render failed" />
      </ErrorBoundary>,
    );

    // Friendly message, NOT the raw JS error
    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
    expect(screen.queryByText(/Render failed/)).not.toBeInTheDocument();
  });

  it('renders a "Reload" button in the fallback UI', () => {
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>,
    );

    const reloadButton = screen.getByRole('button', { name: /recargar/i });
    expect(reloadButton).toBeInTheDocument();
  });

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <SafeChild />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('safe-child')).toBeInTheDocument();
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom</div>}>
        <Thrower />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });
});

// ============================================================================
// Escenario 3: Reload button calls window.location.reload
// ============================================================================

describe('ErrorBoundary — reload button', () => {
  it('calls window.location.reload when the reload button is clicked', async () => {
    const reloadMock = vi.fn();
    const originalReload = window.location.reload;

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, reload: reloadMock },
    });

    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>,
    );

    const reloadButton = screen.getByRole('button', { name: /recargar/i });
    await user.click(reloadButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);

    // Restaurar
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, reload: originalReload },
    });
  });
});
