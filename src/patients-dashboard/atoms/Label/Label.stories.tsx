import type { Meta, StoryObj } from '@storybook/react-vite';
import Label from './Label';

const meta = {
  component: Label,
  title: 'Atoms/Label',
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    htmlFor: 'name',
    children: 'Full Name',
  },
};

export const Required: Story = {
  args: {
    htmlFor: 'email',
    required: true,
    children: 'Email',
  },
};
