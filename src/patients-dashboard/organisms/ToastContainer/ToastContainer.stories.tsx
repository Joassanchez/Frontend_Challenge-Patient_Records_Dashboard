import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastContainer } from './ToastContainer';
import { useToastStore } from '../../store/toast.store';
import type { ToastMessage } from '../../store/toast.store';

const mockToasts: ToastMessage[] = [
  {
    id: 't1',
    type: 'success',
    message: 'Patient saved successfully',
    createdAt: Date.now(),
  },
  {
    id: 't2',
    type: 'info',
    message: 'Loading patient records...',
    createdAt: Date.now(),
  },
  {
    id: 't3',
    type: 'error',
    message: 'Failed to connect to server',
    createdAt: Date.now(),
  },
];

const meta = {
  component: ToastContainer,
  title: 'Organisms/ToastContainer',
  tags: ['autodocs'],
  parameters: {
    zustandStore: {
      store: useToastStore,
      state: { toasts: mockToasts },
    },
  },
} satisfies Meta<typeof ToastContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithToasts: Story = {};

export const SingleToast: Story = {
  parameters: {
    zustandStore: {
      store: useToastStore,
      state: {
        toasts: [mockToasts[0]],
      },
    },
  },
};

export const Empty: Story = {
  parameters: {
    zustandStore: {
      store: useToastStore,
      state: { toasts: [] },
    },
  },
};
