import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusSwitch from '@/patients-dashboard/atoms/StatusSwitch';

describe('StatusSwitch (REQ-IST-01)', () => {
  it('renders with role="switch"', () => {
    render(<StatusSwitch checked={false} onChange={vi.fn()} ariaLabel="Toggle status" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('reflects checked state via aria-checked', () => {
    render(<StatusSwitch checked={true} onChange={vi.fn()} ariaLabel="Toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('reflects unchecked state via aria-checked', () => {
    render(<StatusSwitch checked={false} onChange={vi.fn()} ariaLabel="Toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatusSwitch checked={false} onChange={onChange} ariaLabel="Toggle" />);

    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('has accessible aria-label', () => {
    render(<StatusSwitch checked={false} onChange={vi.fn()} ariaLabel="Activar paciente" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Activar paciente');
  });
});
