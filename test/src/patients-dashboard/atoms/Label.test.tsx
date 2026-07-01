import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Label from '@/patients-dashboard/atoms/Label';

describe('Label', () => {
  it('renders a <label> element with htmlFor', () => {
    render(<Label htmlFor="email">Email</Label>);
    const label = screen.getByText('Email');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'email');
  });

  it('does NOT render required indicator when required is false', () => {
    render(<Label htmlFor="name">Name</Label>);
    const label = screen.getByText('Name');
    // The text content should be exactly "Name" — no asterisk
    expect(label).toHaveTextContent('Name');
    // No element with aria-label="required" should exist
    expect(screen.queryByLabelText('required')).not.toBeInTheDocument();
  });

  it('renders required indicator with aria-label="required" when required is true', () => {
    render(
      <Label htmlFor="name" required>
        Name
      </Label>,
    );
    const indicator = screen.getByLabelText('required');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent('*');
    expect(indicator.tagName).toBe('SPAN');
  });

  it('associates the label with the input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="username">Username</Label>
        <input id="username" />
      </>,
    );
    const input = screen.getByLabelText('Username');
    expect(input).toBeInTheDocument();
  });
});
