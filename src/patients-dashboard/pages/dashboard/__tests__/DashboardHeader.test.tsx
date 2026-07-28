import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardHeader from '../DashboardHeader';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardHeader', () => {
  it('renders the heading and button', () => {
    render(<DashboardHeader onCreatePatient={vi.fn()} />);
    expect(screen.getByText('Tus pacientes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nuevo paciente/i })).toBeInTheDocument();
  });

  it('calls onCreatePatient when button is clicked (online)', async () => {
    const user = userEvent.setup();
    const onCreatePatient = vi.fn();
    render(<DashboardHeader onCreatePatient={onCreatePatient} />);

    await user.click(screen.getByRole('button', { name: /nuevo paciente/i }));
    expect(onCreatePatient).toHaveBeenCalledTimes(1);
  });

  it('button has aria-disabled and disabled styling when isOffline', () => {
    render(<DashboardHeader onCreatePatient={vi.fn()} isOffline />);
    const button = screen.getByRole('button', { name: /nuevo paciente/i });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
  });

  it('does NOT call onCreatePatient when isOffline', async () => {
    const user = userEvent.setup();
    const onCreatePatient = vi.fn();
    render(<DashboardHeader onCreatePatient={onCreatePatient} isOffline />);

    await user.click(screen.getByRole('button', { name: /nuevo paciente/i }));
    expect(onCreatePatient).not.toHaveBeenCalled();
  });
});
