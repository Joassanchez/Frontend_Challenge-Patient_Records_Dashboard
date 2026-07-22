import type { Meta, StoryObj } from '@storybook/react-vite';
import FavoritesSection from './FavoritesSection';
import { usePatientsStore } from '../../store/patients.store';
import { useFavoritesStore } from '../../store/favorites.store';
import type { Patient } from '../../types/patient.types';

const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Ana García',
    description: 'Paciente de neurología.',
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
  component: FavoritesSection,
  title: 'Organisms/FavoritesSection',
  tags: ['autodocs'],
  parameters: {
    zustandStore: [
      {
        store: usePatientsStore,
        state: {
          patients: mockPatients,
          isLoading: false,
          isLoadingMore: false,
          hasMore: false,
          currentPage: 1,
          searchQuery: '',
          error: null,
        },
      },
      {
        store: useFavoritesStore,
        state: {
          favoritePatientIds: ['p1', 'p3'],
        },
      },
    ],
  },
} satisfies Meta<typeof FavoritesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithFavorites: Story = {};

export const Empty: Story = {
  parameters: {
    zustandStore: [
      {
        store: usePatientsStore,
        state: {
          patients: mockPatients,
          isLoading: false,
          isLoadingMore: false,
          hasMore: false,
          currentPage: 1,
          searchQuery: '',
          error: null,
        },
      },
      {
        store: useFavoritesStore,
        state: {
          favoritePatientIds: [],
        },
      },
    ],
  },
};
