import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Avatar from '@/patients-dashboard/atoms/Avatar';

describe('Avatar', () => {
  it('renders initials from name when no src is provided', () => {
    render(<Avatar name="John Doe" />);
    // Should display "JD" as text fallback
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders initials from a single-word name', () => {
    render(<Avatar name="Jane" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders "?" when name is empty', () => {
    render(<Avatar name="" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders "?" when name contains only whitespace', () => {
    render(<Avatar name="   " />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders an <img> when src is provided with alt from name', () => {
    render(<Avatar name="John Doe" src="/avatar.jpg" />);
    const img = screen.getByRole('img');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('alt', 'John Doe');
    expect(img).toHaveAttribute('src', '/avatar.jpg');
  });

  it('falls back to initials when image fails to load', () => {
    render(<Avatar name="Jane" src="/fail.jpg" />);
    const img = screen.getByRole('img');
    // Simulate image load error
    fireEvent.error(img);
    // After error, the img should be hidden and initials shown
    expect(screen.getByText('J')).toBeInTheDocument();
  });


});
