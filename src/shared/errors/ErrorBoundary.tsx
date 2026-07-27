import { Component, type ErrorInfo, type ReactNode } from 'react';
import Icon from '@/patients-dashboard/atoms/Icon';
import Button from '@/patients-dashboard/atoms/Button';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback for nested boundary isolation. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// ---------------------------------------------------------------------------
// ErrorBoundary — componente de clase que captura errores de render
// ---------------------------------------------------------------------------

/**
 * ErrorBoundary de nivel de página o sección.
 * Captura errores no manejados y muestra una UI amigable.
 * Acepta un `fallback` opcional para boundaries anidados (aislamiento).
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      '[ErrorBoundary]',
      error.message,
      {
        componentStack: errorInfo.componentStack,
        stack: error.stack,
      },
    );
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback for nested boundaries
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
          <div role="alert" className="flex items-center gap-2 text-sm text-error">
            <Icon name="alert-circle" size="sm" />
            <span>Algo salió mal. Intentá recargar la página.</span>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={this.handleReload}
          >
            Recargar página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
