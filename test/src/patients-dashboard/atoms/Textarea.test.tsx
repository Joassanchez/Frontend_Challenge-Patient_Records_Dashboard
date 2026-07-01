import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Textarea from '@/patients-dashboard/atoms/Textarea';

describe('Textarea', () => {
  it('renders a <textarea> element with default rows=4', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('accepts custom rows', () => {
    render(<Textarea rows={8} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '8');
  });

  it('sets aria-invalid="true" when error prop is provided', () => {
    render(<Textarea error="Required field" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('does NOT set aria-invalid when no error', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).not.toHaveAttribute('aria-invalid');
  });

  it('accepts aria-describedby for error linkage', () => {
    render(<Textarea aria-describedby="desc-error" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-describedby', 'desc-error');
  });

  it('applies disabled attribute when disabled', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });


});
