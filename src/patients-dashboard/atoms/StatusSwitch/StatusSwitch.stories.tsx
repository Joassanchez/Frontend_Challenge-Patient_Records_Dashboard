import type { Meta, StoryObj } from '@storybook/react-vite';
import StatusSwitch from './StatusSwitch';

const meta = {
  component: StatusSwitch,
  title: 'Atoms/StatusSwitch',
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof StatusSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    checked: true,
    ariaLabel: 'Desactivar paciente',
  },
};

export const Inactive: Story = {
  args: {
    checked: false,
    ariaLabel: 'Activar paciente',
  },
};

export const Disabled: Story = {
  args: {
    checked: true,
    disabled: true,
    ariaLabel: 'Estado del paciente',
  },
};
