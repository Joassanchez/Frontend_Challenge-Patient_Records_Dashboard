import type { Meta, StoryObj } from '@storybook/react-vite';
import PatientForm from './PatientForm';
import type { PatientFormData } from '../../schemas/patient.schema';

const meta = {
  component: PatientForm,
  title: 'Organisms/PatientForm',
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['create', 'edit'],
    },
  },
} satisfies Meta<typeof PatientForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const emptyDefaults: PatientFormData = {
  name: '',
  description: '',
  website: '',
  avatar: '',
};

const editDefaults: PatientFormData = {
  name: 'Ana García',
  description: 'Paciente de neurología',
  website: 'https://example.com/ana',
  avatar: 'https://i.pravatar.cc/150?u=ana',
};

export const Create: Story = {
  args: {
    mode: 'create',
    defaultValues: emptyDefaults,
    onSubmit: (data: PatientFormData) => console.log('Create:', data),
    submitLabel: 'Create patient',
  },
};

export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultValues: editDefaults,
    onSubmit: (data: PatientFormData) => console.log('Edit:', data),
    submitLabel: 'Save changes',
  },
};
