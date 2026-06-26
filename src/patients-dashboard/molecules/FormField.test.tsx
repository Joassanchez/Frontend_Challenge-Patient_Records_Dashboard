import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormField from './FormField';
import Input from '@/patients-dashboard/atoms/Input';
import Textarea from '@/patients-dashboard/atoms/Textarea';

describe('FormField', () => {
  it('renders Label with htmlFor and required indicator', () => {
    render(
      <FormField label="Email" htmlFor="email" required>
        <Input id="email" />
      </FormField>,
    );
    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();
    // Required indicator should be present
    expect(screen.getByLabelText('required')).toBeInTheDocument();
  });

  it('renders the child input with aria-invalid when error is present', () => {
    render(
      <FormField label="Email" htmlFor="email" error="Invalid">
        <Input id="email" />
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('wires aria-describedby from child to error message id', () => {
    render(
      <FormField label="Email" htmlFor="email" error="Required">
        <Input id="email" />
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    const errorMsg = screen.getByRole('alert');
    expect(errorMsg).toHaveAttribute('id', 'email-error');
  });

  it('renders error message when error prop is present', () => {
    render(
      <FormField label="Name" htmlFor="name" error="Too short">
        <Input id="name" />
      </FormField>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Too short');
  });

  it('does NOT render error message when no error', () => {
    render(
      <FormField label="Name" htmlFor="name">
        <Input id="name" />
      </FormField>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('works with Textarea as child', () => {
    render(
      <FormField label="Bio" htmlFor="bio" error="Required">
        <Textarea id="bio" />
      </FormField>,
    );
    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('aria-describedby', 'bio-error');
  });

  it('does NOT require id on the child — falls back gracefully', () => {
    render(
      <FormField label="Name" htmlFor="name">
        <Input />
      </FormField>,
    );
    // Should render without crashing
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });
});
