import type { Meta, StoryObj } from '@storybook/react-vite';
import Input from './Input';

const meta = {
  component: Input,
  title: 'Atoms/Input',
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Search patients...',
  },
};

export const WithError: Story = {
  args: {
    error: 'This field is required',
    defaultValue: '',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Cannot edit',
  },
};
