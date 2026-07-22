import type { Meta, StoryObj } from '@storybook/react-vite';
import Badge from './Badge';

const meta = {
  component: Badge,
  title: 'Atoms/Badge',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'success', 'error', 'favorite', 'inactive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Neutral',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Stable',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Critical',
  },
};

export const Favorite: Story = {
  args: {
    variant: 'favorite',
    children: 'Starred',
  },
};

export const Inactive: Story = {
  args: {
    variant: 'inactive',
    children: 'Archived',
  },
};

export const Small: Story = {
  args: {
    variant: 'success',
    size: 'sm',
    children: 'Small',
  },
};
