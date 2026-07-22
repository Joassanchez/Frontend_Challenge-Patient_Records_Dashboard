import type { Meta, StoryObj } from '@storybook/react-vite';
import Modal from './Modal';

const meta = {
  component: Modal,
  title: 'Molecules/Modal',
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Edit Patient',
    ariaLabel: 'Edit patient dialog',
    children: (
      <div className="space-y-4">
        <p>Modal content goes here.</p>
        <p>This modal uses motion/react for animations.</p>
      </div>
    ),
  },
};

export const WithActions: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Confirm Delete',
    ariaLabel: 'Confirm delete dialog',
    children: (
      <div className="flex flex-col gap-4">
        <p>Are you sure you want to delete this patient?</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-4 py-2 text-sm"
            onClick={() => {}}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-error px-4 py-2 text-sm text-white"
            onClick={() => {}}
          >
            Delete
          </button>
        </div>
      </div>
    ),
  },
};

export const ScrollableContent: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Patient Details',
    ariaLabel: 'Patient details dialog',
    children: (
      <div className="space-y-4">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    title: 'Hidden Modal',
    ariaLabel: 'Hidden dialog',
    children: <p>This should not be visible</p>,
  },
};
