import type { Meta, StoryObj } from '@storybook/react-vite';
import Container from './Container';

const meta = {
  component: Container,
  title: 'Molecules/Container',
  tags: ['autodocs'],
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <p>Content inside container</p>,
  },
};

export const WithContent: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Section Title</h2>
        <p>This is a paragraph inside the container with max-width and padding.</p>
        <div className="flex gap-2">
          <span className="rounded bg-primary/10 px-2 py-1 text-sm text-primary">Tag 1</span>
          <span className="rounded bg-primary/10 px-2 py-1 text-sm text-primary">Tag 2</span>
        </div>
      </div>
    ),
  },
};

export const MaxWidth: Story = {
  args: {
    className: 'max-w-3xl',
    children: <p className="text-center text-slate-500">Constrained to max-w-3xl</p>,
  },
};
