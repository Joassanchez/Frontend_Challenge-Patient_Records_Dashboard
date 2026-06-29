import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

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
