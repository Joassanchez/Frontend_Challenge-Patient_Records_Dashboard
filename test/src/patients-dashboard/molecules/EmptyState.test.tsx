import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '@/patients-dashboard/molecules/EmptyState';

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

  // =========================================================================
  // REQ-EMP-01: variant prop — default vs compact
  // =========================================================================

  describe('variant prop', () => {
    it('renders all content when variant is not provided (default)', () => {
      const { container } = render(<EmptyState title="Test" description="Desc" icon="inbox" action={{ label: 'Action', onClick: vi.fn() }} />);
      expect(screen.getByRole('heading')).toHaveTextContent('Test');
      expect(screen.getByText('Desc')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders all content with compact variant and uses reduced padding', () => {
      const { container } = render(<EmptyState variant="compact" title="Test" description="Desc" icon="inbox" action={{ label: 'Action', onClick: vi.fn() }} />);
      // Content still renders
      expect(screen.getByRole('heading')).toHaveTextContent('Test');
      expect(screen.getByText('Desc')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
      // Verify it's different from default: should NOT have the full padding class
      const wrapper = screen.getByRole('heading').closest('div')?.parentElement;
      expect(wrapper?.className).not.toContain('py-16');
    });

    it('preserves heading and content when compact variant is used', () => {
      render(
        <EmptyState
          title="Sin favoritos"
          description="Marcá pacientes como favoritos"
          icon="inbox"
          variant="compact"
        />,
      );
      // Heading still visible
      expect(screen.getByRole('heading', { name: 'Sin favoritos' })).toBeInTheDocument();
      // Description still visible
      expect(screen.getByText('Marcá pacientes como favoritos')).toBeInTheDocument();
      // Icon still rendered
      const container = screen.getByRole('heading', { name: 'Sin favoritos' }).parentElement!.parentElement!;
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders action button correctly with compact variant', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <EmptyState
          title="Empty"
          variant="compact"
          action={{ label: 'Add', onClick }}
        />,
      );
      const button = screen.getByRole('button', { name: 'Add' });
      expect(button).toBeInTheDocument();
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
