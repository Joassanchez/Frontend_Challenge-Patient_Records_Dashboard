import type { Meta, StoryObj } from '@storybook/react-vite';
import Textarea from './Textarea';

const meta = {
  component: Textarea,
  title: 'Atoms/Textarea',
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Enter patient notes...',
  },
};

export const WithError: Story = {
  args: {
    error: 'Description is required',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Cannot edit this field',
  },
};
