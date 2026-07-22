import type { Meta, StoryObj } from '@storybook/react-vite';
import PatientCard from './PatientCard';
import { useFavoritesStore } from '../../store/favorites.store';
import { useModalStore } from '../../store/modal.store';
import { useToastStore } from '../../store/toast.store';
import type { Patient } from '../../types/patient.types';

const mockPatient: Patient = {
  id: 'p1',
  name: 'Ana García',
  description: 'Paciente de neurología con historial de migrañas crónicas.',
  website: 'https://example.com/ana',
  avatar: 'https://i.pravatar.cc/150?u=ana',
  createdAt: '2024-01-15T10:30:00Z',
};

const meta = {
  component: PatientCard,
  title: 'Organisms/PatientCard',
  tags: ['autodocs'],
  parameters: {
    zustandStore: [
      {
        store: useFavoritesStore,
        state: { favoritePatientIds: [] },
      },
      {
        store: useModalStore,
        state: { isOpen: false, mode: 'create', selectedPatientId: null },
      },
      {
        store: useToastStore,
        state: { toasts: [] },
      },
    ],
  },
} satisfies Meta<typeof PatientCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    patient: mockPatient,
  },
};

export const IsFavorite: Story = {
  args: {
    patient: mockPatient,
  },
  parameters: {
    zustandStore: [
      {
        store: useFavoritesStore,
        state: { favoritePatientIds: ['p1'] },
      },
      {
        store: useModalStore,
        state: { isOpen: false, mode: 'create', selectedPatientId: null },
      },
      {
        store: useToastStore,
        state: { toasts: [] },
      },
    ],
  },
};

export const WithoutWebsite: Story = {
  args: {
    patient: {
      ...mockPatient,
      website: '',
      avatar: '',
    },
  },
};
