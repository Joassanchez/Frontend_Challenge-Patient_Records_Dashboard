import type { Meta, StoryObj } from '@storybook/react-vite';
import SkeletonCard from './SkeletonCard';

const meta = {
  component: SkeletonCard,
  title: 'Atoms/SkeletonCard',
  tags: ['autodocs'],
} satisfies Meta<typeof SkeletonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomWidth: Story = {
  args: {
    className: 'max-w-sm',
  },
};
