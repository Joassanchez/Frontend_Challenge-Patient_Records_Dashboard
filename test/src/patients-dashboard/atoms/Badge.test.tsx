import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/patients-dashboard/atoms/Badge';

describe('Badge', () => {
  it('renders as a <span> with text content', () => {
    render(<Badge>Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toBeInTheDocument();
  });


});
