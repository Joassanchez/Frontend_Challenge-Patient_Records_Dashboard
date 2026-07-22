import type { Meta, StoryObj } from '@storybook/react-vite';
import Avatar from './Avatar';

const meta = {
  component: Avatar,
  title: 'Atoms/Avatar',
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Ana García',
  },
};

export const WithImage: Story = {
  args: {
    name: 'Ana García',
    src: 'https://i.pravatar.cc/150?u=ana',
  },
};

export const InitialsFallback: Story = {
  args: {
    name: 'María López',
    src: 'https://broken-url.invalid/img.jpg',
  },
};

export const Small: Story = {
  args: {
    name: 'Carlos Ruiz',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    name: 'Laura Fernández',
    size: 'lg',
  },
};
