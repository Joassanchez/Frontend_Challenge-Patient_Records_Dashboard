import type { Meta, StoryObj } from '@storybook/react-vite';
import Header from './Header';

const meta = {
  component: Header,
  title: 'Organisms/Header',
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
