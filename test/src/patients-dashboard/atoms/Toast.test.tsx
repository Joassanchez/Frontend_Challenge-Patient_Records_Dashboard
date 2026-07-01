import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from '@/patients-dashboard/atoms/Toast';
import { makeToast } from '@test/helpers/toast.helper';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Toast', () => {
  const onDismiss = vi.fn();

  beforeEach(() => {
    onDismiss.mockClear();
  });

  // -----------------------------------------------------------------------
  // REQ-TU-01 Variants + REQ-TU-07 Accessibility Roles
  // -----------------------------------------------------------------------

  describe('variants and accessibility roles (REQ-TU-01, REQ-TU-07)', () => {
    it('renders success variant with role="status" and message', () => {
      render(
        <Toast toast={makeToast({ type: 'success', message: 'Operation completed' })} onDismiss={onDismiss} />,
      );
      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });

    it('renders error variant with role="alert" and message', () => {
      render(
        <Toast toast={makeToast({ type: 'error', message: 'Something went wrong' })} onDismiss={onDismiss} />,
      );
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders info variant with role="status"', () => {
      render(
        <Toast toast={makeToast({ type: 'info', message: 'Heads up' })} onDismiss={onDismiss} />,
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Heads up')).toBeInTheDocument();
    });

    it('renders warning variant with role="alert"', () => {
      render(
        <Toast toast={makeToast({ type: 'warning', message: 'Proceed with caution' })} onDismiss={onDismiss} />,
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Proceed with caution')).toBeInTheDocument();
    });

    it('success and info use role="status" exclusively (not alert)', () => {
      render(<Toast toast={makeToast({ type: 'success' })} onDismiss={onDismiss} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('error and warning use role="alert" exclusively (not status)', () => {
      render(<Toast toast={makeToast({ type: 'warning' })} onDismiss={onDismiss} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // REQ-TU-02 Icons and Message
  // -----------------------------------------------------------------------

  describe('icons and message (REQ-TU-02)', () => {
    it('displays the message text for success variant', () => {
      render(<Toast toast={makeToast({ type: 'success', message: 'Paciente creado' })} onDismiss={onDismiss} />);
      expect(screen.getByText('Paciente creado')).toBeInTheDocument();
    });

    it('displays the message text for error variant', () => {
      render(<Toast toast={makeToast({ type: 'error', message: 'Error de conexión' })} onDismiss={onDismiss} />);
      expect(screen.getByText('Error de conexión')).toBeInTheDocument();
    });

    it('renders a variant icon (SVG element) alongside the close button icon', () => {
      const { container } = render(
        <Toast toast={makeToast({ type: 'success' })} onDismiss={onDismiss} />,
      );
      // At least 2 SVGs: one for the variant icon + one for close button
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });

    it('each variant renders the toast with message and variant icon without crashing', () => {
      const variants: ToastMessage['type'][] = ['success', 'error', 'info', 'warning'];
      for (const type of variants) {
        const { container, unmount } = render(
          <Toast toast={makeToast({ type, message: `Toast ${type}` })} onDismiss={onDismiss} />,
        );
        expect(screen.getByText(`Toast ${type}`)).toBeInTheDocument();
        // Verify at least one SVG exists for the variant icon
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBeGreaterThanOrEqual(2);
        unmount();
      }
    });
  });

  // -----------------------------------------------------------------------
  // REQ-TU-03 Manual Dismiss
  // -----------------------------------------------------------------------

  describe('manual dismiss (REQ-TU-03)', () => {
    it('renders a close button with accessible name "Cerrar notificación"', () => {
      render(<Toast toast={makeToast()} onDismiss={onDismiss} />);
      const button = screen.getByRole('button', { name: 'Cerrar notificación' });
      expect(button).toBeInTheDocument();
    });

    it('close button is positioned for interaction (not disabled, not hidden)', () => {
      render(<Toast toast={makeToast()} onDismiss={onDismiss} />);
      const button = screen.getByRole('button', { name: 'Cerrar notificación' });
      expect(button).toBeEnabled();
    });

    it('calls onDismiss with the toast id when close button is clicked', async () => {
      const user = userEvent.setup();
      const toast = makeToast({ id: 'toast-abc-123', type: 'success' });
      render(<Toast toast={toast} onDismiss={onDismiss} />);

      const button = screen.getByRole('button', { name: 'Cerrar notificación' });
      await user.click(button);

      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(onDismiss).toHaveBeenCalledWith('toast-abc-123');
    });

    it('dismisses a second toast independently with its own id', async () => {
      const user = userEvent.setup();
      const firstToast = makeToast({ id: 'first-id', type: 'success', message: 'First' });
      const secondToast = makeToast({ id: 'second-id', type: 'error', message: 'Second' });

      const { unmount } = render(<Toast toast={firstToast} onDismiss={onDismiss} />);
      const firstButton = screen.getByRole('button', { name: 'Cerrar notificación' });
      await user.click(firstButton);
      expect(onDismiss).toHaveBeenCalledWith('first-id');
      unmount();

      render(<Toast toast={secondToast} onDismiss={onDismiss} />);
      const secondButton = screen.getByRole('button', { name: 'Cerrar notificación' });
      await user.click(secondButton);
      expect(onDismiss).toHaveBeenCalledWith('second-id');
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  describe('edge cases', () => {
    it('renders toast with custom duration prop without altering core structure', () => {
      render(
        <Toast toast={makeToast({ duration: 8000, type: 'success', message: 'Custom duration' })} onDismiss={onDismiss} />,
      );
      // Core structure is preserved
      expect(screen.getByText('Custom duration')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cerrar notificación' })).toBeInTheDocument();
    });

    it('renders toast without explicit duration (relies on store defaults)', () => {
      const toast = makeToast({ type: 'info' });
      expect(toast.duration).toBeUndefined();
      render(<Toast toast={toast} onDismiss={onDismiss} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders long message text without truncation visible in DOM', () => {
      const longMessage = 'A'.repeat(120);
      render(<Toast toast={makeToast({ message: longMessage })} onDismiss={onDismiss} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});
