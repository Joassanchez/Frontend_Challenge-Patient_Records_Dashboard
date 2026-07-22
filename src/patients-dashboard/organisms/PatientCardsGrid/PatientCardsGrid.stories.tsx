import type { Meta, StoryObj } from '@storybook/react-vite';
import PatientCardsGrid from './PatientCardsGrid';
import type { Patient } from '../../types/patient.types';

const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Ana García',
    description: 'Paciente de neurología con historial de migrañas crónicas.',
    website: 'https://example.com/ana',
    avatar: 'https://i.pravatar.cc/150?u=ana',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'p2',
    name: 'Carlos Ruiz',
    description: 'Control rutinario de cardiología.',
    website: 'https://example.com/carlos',
    avatar: 'https://i.pravatar.cc/150?u=carlos',
    createdAt: '2024-02-20T14:00:00Z',
  },
  {
    id: 'p3',
    name: 'María López',
    description: 'Seguimiento post-operatorio.',
    website: '',
    avatar: '',
    createdAt: '2024-03-10T09:15:00Z',
  },
];

const meta = {
  component: PatientCardsGrid,
  title: 'Organisms/PatientCardsGrid',
  tags: ['autodocs'],
} satisfies Meta<typeof PatientCardsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    patients: mockPatients,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    patients: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    patients: [],
    isLoading: false,
  },
};

export const SinglePatient: Story = {
  args: {
    patients: [mockPatients[0]],
    isLoading: false,
  },
};
