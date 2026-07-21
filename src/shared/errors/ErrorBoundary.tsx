import { Component, type ErrorInfo, type ReactNode } from 'react';
import ErrorMessage from '@/patients-dashboard/molecules/ErrorMessage';
import Button from '@/patients-dashboard/atoms/Button';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

// ---------------------------------------------------------------------------
// ErrorBoundary — componente de clase que captura errores de render
// ---------------------------------------------------------------------------

/**
 * ErrorBoundary de nivel de página.
 * Captura errores no manejados en el árbol de componentes hijo y muestra
 * una UI de fallback con el mensaje de error y un botón para recargar.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Actualiza el estado para que el próximo render muestre el fallback
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Registra el error con metadata del componente
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
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
          <ErrorMessage message={this.state.message} />
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
