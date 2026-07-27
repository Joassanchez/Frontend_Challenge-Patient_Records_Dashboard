import type { Meta, StoryObj } from '@storybook/react-vite';
import Banner from './Banner';

const meta = {
  component: Banner,
  title: 'Organisms/Banner',
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
    isStale: { control: 'boolean' },
    isOffline: { control: 'boolean' },
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StaleData: Story = {
  args: {
    isStale: true,
  },
};

export const Offline: Story = {
  args: {
    isOffline: true,
  },
};

export const CustomMessage: Story = {
  args: {
    message: 'Actualizando datos del servidor...',
  },
};

export const Dismissable: Story = {
  args: {
    message: 'Podés cerrar este banner',
    onDismiss: () => alert('Dismissed'),
  },
};
