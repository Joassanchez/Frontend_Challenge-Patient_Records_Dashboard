import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  it('renders as a <span> with text content', () => {
    render(<Badge>Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toBeInTheDocument();
  });

  it('defaults to neutral variant', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toBeInTheDocument();
  });

  it('renders success variant with correct semantic indication', () => {
    render(<Badge variant="success">Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
  });

  it('renders error variant', () => {
    render(<Badge variant="error">Failed</Badge>);
    const badge = screen.getByText('Failed');
    expect(badge).toBeInTheDocument();
  });

  it('renders favorite variant', () => {
    render(<Badge variant="favorite">Starred</Badge>);
    const badge = screen.getByText('Starred');
    expect(badge).toBeInTheDocument();
  });

  it('renders inactive variant', () => {
    render(<Badge variant="inactive">Archived</Badge>);
    const badge = screen.getByText('Archived');
    expect(badge).toBeInTheDocument();
  });

  it('renders sm size', () => {
    render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText('Small');
    expect(badge).toBeInTheDocument();
  });
});
