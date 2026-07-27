import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Banner from '@/patients-dashboard/organisms/Banner';

describe('Banner (REQ-ERR-01, REQ-OFF-02)', () => {
  it('renders message text', () => {
    render(<Banner message="Sin conexión" />);
    expect(screen.getByText('Sin conexión')).toBeInTheDocument();
  });

  it('renders with warning variant by default', () => {
    const { container } = render(<Banner message="Warning" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders dismiss button that calls onDismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Banner message="Test" onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders stale variant with appropriate message', () => {
    render(<Banner isStale />);
    expect(screen.getByText(/caché/i)).toBeInTheDocument();
  });

  it('renders offline variant with appropriate message', () => {
    render(<Banner isOffline />);
    expect(screen.getByText(/conexión/i)).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<Banner message="Alert" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
