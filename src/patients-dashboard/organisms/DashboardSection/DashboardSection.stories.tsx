import type { Meta, StoryObj } from '@storybook/react-vite';
import DashboardSection from './DashboardSection';

const meta = {
  component: DashboardSection,
  title: 'Organisms/DashboardSection',
  tags: ['autodocs'],
  argTypes: {
    counterPlacement: {
      control: 'select',
      options: ['below', 'inline'],
    },
  },
} satisfies Meta<typeof DashboardSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    headingId: 'section-heading',
    title: 'Patients',
    children: <p className="text-slate-500">Section content goes here.</p>,
  },
};

export const WithCounter: Story = {
  args: {
    headingId: 'section-heading',
    title: 'Patients',
    counter: '12 records found',
    children: <p className="text-slate-500">Section content goes here.</p>,
  },
};

export const WithCounterInline: Story = {
  args: {
    headingId: 'section-heading',
    title: 'Patients',
    counter: '12 records',
    counterPlacement: 'inline',
    children: <p className="text-slate-500">Section content goes here.</p>,
  },
};

export const WithActions: Story = {
  args: {
    headingId: 'section-heading',
    title: 'Patients',
    counter: '5 records',
    actions: (
      <button
        type="button"
        className="rounded-md bg-primary px-4 py-2 text-sm text-white"
        onClick={() => {}}
      >
        Add Patient
      </button>
    ),
    children: <p className="text-slate-500">Section content goes here.</p>,
  },
};
