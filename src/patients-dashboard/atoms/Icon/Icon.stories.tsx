import type { Meta, StoryObj } from '@storybook/react-vite';
import Icon from './Icon';

const meta = {
  component: Icon,
  title: 'Atoms/Icon',
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'search', 'alert-circle', 'check', 'close', 'inbox',
        'plus', 'user', 'eye', 'edit', 'heart',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'search',
  },
};

export const Small: Story = {
  args: {
    name: 'heart',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    name: 'heart',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    name: 'heart',
    size: 'lg',
  },
};

export const WithTooltip: Story = {
  args: {
    name: 'alert-circle',
    label: 'Warning: check your input',
  },
};
