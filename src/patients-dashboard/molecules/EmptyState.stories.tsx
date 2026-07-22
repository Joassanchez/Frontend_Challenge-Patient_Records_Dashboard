import type { Meta, StoryObj } from '@storybook/react-vite';
import EmptyState from './EmptyState';

const meta = {
  component: EmptyState,
  title: 'Molecules/EmptyState',
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'select',
      options: ['search', 'inbox', 'user', 'alert-circle'],
    },
    variant: {
      control: 'select',
      options: ['default', 'compact'],
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'No patients found',
    description: 'Try adjusting your search criteria',
    icon: 'search',
  },
};

export const WithCustomMessage: Story = {
  args: {
    title: 'No favorites yet',
    description: 'Mark patients as favorites to see them here',
    icon: 'inbox',
  },
};

export const WithAction: Story = {
  args: {
    title: 'No patients loaded',
    description: 'Create your first patient to get started',
    icon: 'user',
    action: {
      label: 'Add patient',
      onClick: () => alert('Add patient clicked'),
    },
  },
};

export const Compact: Story = {
  args: {
    title: 'No results',
    description: 'No matching records',
    icon: 'search',
    variant: 'compact',
  },
};
