import type { Meta, StoryObj } from '@storybook/react-vite';
import ErrorMessage from './ErrorMessage';

const meta = {
  component: ErrorMessage,
  title: 'Molecules/ErrorMessage',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['block', 'inline'],
    },
  },
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Something went wrong',
  },
};

export const ShortMessage: Story = {
  args: {
    message: 'Required field',
    variant: 'inline',
  },
};

export const LongMessage: Story = {
  args: {
    message: 'Unable to load patient records. Please check your internet connection and try again. If the problem persists, contact support.',
  },
};
