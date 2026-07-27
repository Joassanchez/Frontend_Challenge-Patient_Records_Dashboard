import type { Meta, StoryObj } from '@storybook/react-vite';
import AvatarPreview from './AvatarPreview';

const meta = {
  component: AvatarPreview,
  title: 'Molecules/AvatarPreview',
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    name: { control: 'text' },
    debounceMs: { control: 'number' },
  },
} satisfies Meta<typeof AvatarPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithValidUrl: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    name: 'María García',
  },
};

export const EmptyUrl: Story = {
  args: {
    src: '',
    name: 'Carlos López',
  },
};

export const NoName: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=3',
    name: '',
  },
};

export const CustomDebounce: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=5',
    name: 'Ana Martínez',
    debounceMs: 1000,
  },
};
