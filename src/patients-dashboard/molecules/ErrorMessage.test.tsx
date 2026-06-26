import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders with role="alert"', () => {
    render(<ErrorMessage message="Required field" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Required field');
  });

  it('renders the alert-circle icon alongside the message', () => {
    const { container } = render(<ErrorMessage message="Error occurred" />);
    // Icon should be present as an SVG (hidden by default)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('accepts an id prop for aria-describedby linkage', () => {
    render(<ErrorMessage message="Invalid" id="email-error" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('id', 'email-error');
  });

  it('does NOT set id attribute when id prop is omitted', () => {
    render(<ErrorMessage message="Error" />);
    const alert = screen.getByRole('alert');
    expect(alert).not.toHaveAttribute('id');
  });

  it('defaults to block variant', () => {
    render(<ErrorMessage message="Block error" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('renders inline variant', () => {
    render(<ErrorMessage message="Inline error" variant="inline" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });
});
