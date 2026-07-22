import type { Meta, StoryObj } from '@storybook/react-vite';
import DashboardLayout from './DashboardLayout';

const meta = {
  component: DashboardLayout,
  title: 'Organisms/DashboardLayout',
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Dashboard Content</h2>
        <p className="text-slate-500">This is the main content area.</p>
      </div>
    ),
  },
};

export const WithMultipleSections: Story = {
  args: {
    children: (
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-2">Patients</h2>
          <p className="text-slate-500">Patient list goes here.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">Favorites</h2>
          <p className="text-slate-500">Favorites section goes here.</p>
        </section>
      </div>
    ),
  },
};
