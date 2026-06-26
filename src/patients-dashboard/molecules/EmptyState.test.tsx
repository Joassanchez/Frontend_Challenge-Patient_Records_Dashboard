import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders title as a heading', () => {
    render(<EmptyState title="No results" />);
    const heading = screen.getByRole('heading', { name: 'No results' });
    expect(heading).toBeInTheDocument();
  });

  it('renders optional description as a paragraph', () => {
    render(
      <EmptyState
        title="Empty"
        description="Try adjusting your search."
      />,
    );
    expect(screen.getByText('Try adjusting your search.')).toBeInTheDocument();
  });

  it('does NOT render description when not provided', () => {
    render(<EmptyState title="Empty" />);
    const heading = screen.getByRole('heading');
    // Only heading should be present, no extra text nodes from description
    expect(heading).toBeInTheDocument();
  });

  it('renders Icon when icon prop is provided', () => {
    const { container } = render(
      <EmptyState title="No results" icon="inbox" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('does NOT render Icon when icon prop is omitted', () => {
    const { container } = render(<EmptyState title="Empty" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('renders action Button when action prop is provided', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="No patients"
        action={{ label: 'Add Patient', onClick }}
      />,
    );
    const button = screen.getByRole('button', { name: 'Add Patient' });
    expect(button).toBeInTheDocument();
  });

  it('calls action onClick when button is clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <EmptyState
        title="Empty"
        action={{ label: 'Add', onClick }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does NOT render button when action is omitted', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
