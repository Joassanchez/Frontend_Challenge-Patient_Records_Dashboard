import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
  it('renders a search input with a search icon', () => {
    const { container } = render(
      <SearchInput value="" onChange={() => {}} />,
    );
    // type="search" inputs have role "searchbox"
    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
    // Search icon SVG should be present
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('does NOT show clear button when value is empty', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows clear button when value is non-empty', () => {
    render(<SearchInput value="test" onChange={() => {}} />);
    const clearBtn = screen.getByRole('button');
    expect(clearBtn).toBeInTheDocument();
  });

  it('calls onChange with empty string when clear button is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchInput value="test" onChange={onChange} />);
    await user.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('forwards placeholder to the underlying input', () => {
    render(
      <SearchInput
        value=""
        onChange={() => {}}
        placeholder="Search patients..."
      />,
    );
    expect(
      screen.getByPlaceholderText('Search patients...'),
    ).toBeInTheDocument();
  });

  it('updates value through the input', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchInput value="" onChange={onChange} />);
    const input = screen.getByRole('searchbox');
    await user.type(input, 'a');
    // onChange should be called for each keystroke
    expect(onChange).toHaveBeenCalled();
  });
});
