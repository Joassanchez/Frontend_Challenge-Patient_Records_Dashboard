import type { Meta, StoryObj } from '@storybook/react-vite';
import FormField from './FormField';
import Input from '../atoms/Input';

const meta = {
  component: FormField,
  title: 'Molecules/FormField',
  tags: ['autodocs'],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Full Name',
    htmlFor: 'name',
    children: <Input id="name" placeholder="Enter name" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    htmlFor: 'email',
    error: 'Please enter a valid email address',
    required: true,
    children: <Input id="email" type="email" placeholder="email@example.com" />,
  },
};

export const WithHelpText: Story = {
  args: {
    label: 'Phone',
    htmlFor: 'phone',
    required: true,
    children: <Input id="phone" type="tel" placeholder="+54 11 1234-5678" />,
  },
};
