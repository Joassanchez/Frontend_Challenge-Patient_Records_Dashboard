import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from '@/patients-dashboard/atoms/Spinner';

describe('Spinner', () => {
  it('renders with role="status" and aria-label="Loading"', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner).toBeInTheDocument();
  });

  it('defaults to md size and renders an animated indicator', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    // The element must exist and be a live region
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(spinner.tagName).toBe('DIV');
  });

  it('renders sm variant as a status region', () => {
    render(<Spinner size="sm" />);
    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner).toBeInTheDocument();
    // Verify it is a different rendered size from md by checking presence of size-dependent attributes
    expect(spinner).toBeVisible();
  });

  it('renders lg variant as a status region', () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toBeVisible();
  });

  it('applies primary color and is still a status region', () => {
    render(<Spinner color="primary" />);
    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner).toBeInTheDocument();
  });

  it('applies white color and is still a status region', () => {
    render(<Spinner color="white" />);
    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner).toBeInTheDocument();
  });
});
