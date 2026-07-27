import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import SearchInput from './SearchInput';

const meta = {
  component: SearchInput,
  title: 'Molecules/SearchInput',
  tags: ['autodocs'],
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <SearchInput
        value={value}
        onChange={setValue}
        placeholder={args.placeholder}
      />
    );
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Search patients...',
  },
};

export const WithText: Story = {
  args: {
    value: 'Ana García',
    onChange: () => {},
    placeholder: 'Search patients...',
  },
};

export const WithResults: Story = {
  args: {
    value: 'Description',
    onChange: () => {},
    placeholder: 'Search by name or description',
  },
};
