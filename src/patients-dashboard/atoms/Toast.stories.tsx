import type { Meta, StoryObj } from '@storybook/react-vite';
import Toast from './Toast';
import type { ToastMessage } from '../store/toast.store';

const meta = {
  component: Toast,
  title: 'Atoms/Toast',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '1rem', maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseToast: ToastMessage = {
  id: 'toast-1',
  type: 'info',
  message: 'This is an informational message',
  createdAt: Date.now(),
};

export const Info: Story = {
  args: {
    toast: { ...baseToast, type: 'info', message: 'Patient record updated' },
    onDismiss: () => {},
  },
};

export const Success: Story = {
  args: {
    toast: { ...baseToast, type: 'success', message: 'Patient saved successfully' },
    onDismiss: () => {},
  },
};

export const Error: Story = {
  args: {
    toast: { ...baseToast, type: 'error', message: 'Failed to load patient data' },
    onDismiss: () => {},
  },
};

export const Warning: Story = {
  args: {
    toast: { ...baseToast, type: 'warning', message: 'Session expiring soon' },
    onDismiss: () => {},
  },
};

export const WithAction: Story = {
  args: {
    toast: { ...baseToast, type: 'success', message: 'Changes saved' },
    onDismiss: (id: string) => console.log('Dismissed:', id),
  },
};
