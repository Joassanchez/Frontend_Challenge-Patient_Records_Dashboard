import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import Modal from '@/patients-dashboard/molecules/Modal';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderModal(
  overrides?: Partial<{ isOpen: boolean; onClose: () => void; title: string; ariaLabel: string }>,
) {
  return render(
    <Modal
      isOpen={overrides?.isOpen ?? true}
      onClose={overrides?.onClose ?? vi.fn()}
      title={overrides?.title ?? 'Crear paciente'}
      ariaLabel={overrides?.ariaLabel ?? 'Crear paciente'}
    >
      <p>Contenido del formulario</p>
    </Modal>,
  );
}

// ============================================================================
// REQ-MC-01: Renderizado y accesibilidad
// ============================================================================

describe('REQ-MC-01: Renderizado y accesibilidad', () => {
  it('renders with role="dialog", aria-modal="true" and aria-labelledby', () => {
    renderModal();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(dialog).not.toHaveAttribute('aria-label');
  });

  it('renders the title as visible text inside the modal header', () => {
    renderModal({ title: 'Editar paciente' });

    expect(screen.getByText('Editar paciente')).toBeInTheDocument();
  });

  it('renders a close button with accessible name "Cerrar"', () => {
    renderModal();

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('renders children inside the modal body', () => {
    renderModal();

    expect(screen.getByText('Contenido del formulario')).toBeInTheDocument();
  });

  it('renders nothing when isOpen is false', () => {
    renderModal({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

// ============================================================================
// REQ-MC-02: Cierre por overlay click
// ============================================================================

describe('REQ-MC-02: Cierre por overlay click', () => {
  it('invokes onClose when the overlay is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal({ onClose });

    // Overlay — no semantic role, fallback to data-testid is justified here
    const overlay = screen.getByTestId('modal-overlay');
    await user.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// REQ-MC-03: Cierre por ESC
// ============================================================================

describe('REQ-MC-03: Cierre por Escape', () => {
  it('invokes onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal({ onClose });

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// REQ-MC-04: Foco inicial
// ============================================================================

describe('REQ-MC-04: Foco inicial', () => {
  it('moves focus to the close button when modal opens', () => {
    renderModal();

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    expect(document.activeElement).toBe(closeButton);
  });
});

// ============================================================================
// REQ-MC-05: Click en panel no cierra
// ============================================================================

describe('REQ-MC-05: Click en panel no cierra', () => {
  it('does NOT invoke onClose when the panel interior is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal({ onClose });

    await user.click(screen.getByText('Contenido del formulario'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calling onClose via close button DOES trigger onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal({ onClose });

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// REQ-MA-01, REQ-MA-02: Focus trap
// ============================================================================

function ModalWithTrigger({ isOpen = true }: { isOpen?: boolean }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <div>
      <button ref={triggerRef} data-testid="trigger">
        Open modal
      </button>
      <Modal
        isOpen={isOpen}
        onClose={vi.fn()}
        title="Test modal"
        ariaLabel="Test modal"
        triggerRef={triggerRef}
      >
        <input data-testid="input-a" type="text" />
        <input data-testid="input-b" type="text" />
        <button data-testid="action-btn">Action</button>
      </Modal>
    </div>
  );
}

describe('REQ-MA-01: Focus trap — Tab stays in modal', () => {
  it('Tab on last focusable element wraps to first focusable element', async () => {
    const user = userEvent.setup();
    render(<ModalWithTrigger />);

    const actionBtn = screen.getByTestId('action-btn');
    const closeButton = screen.getByRole('button', { name: /cerrar/i });

    // Focus the last element in the modal body
    actionBtn.focus();
    expect(document.activeElement).toBe(actionBtn);

    // Tab should wrap to the close button (first focusable)
    await user.tab();
    expect(document.activeElement).toBe(closeButton);
  });
});

describe('REQ-MA-02: Focus trap — Shift+Tab wraps', () => {
  it('Shift+Tab on first focusable element wraps to last', async () => {
    const user = userEvent.setup();
    render(<ModalWithTrigger />);

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    const actionBtn = screen.getByTestId('action-btn');

    // Close button is focused on open
    expect(document.activeElement).toBe(closeButton);

    // Shift+Tab should wrap to the last focusable element
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(actionBtn);
  });
});

describe('REQ-MA-02: Focus restores to trigger on close', () => {
  it('focus returns to the trigger button when modal closes', () => {
    const { rerender } = render(<ModalWithTrigger />);

    const trigger = screen.getByTestId('trigger');

    // Close the modal
    rerender(<ModalWithTrigger isOpen={false} />);

    expect(document.activeElement).toBe(trigger);
  });
});
