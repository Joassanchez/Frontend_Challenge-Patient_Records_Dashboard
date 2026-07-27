import type { Meta, StoryObj } from '@storybook/react-vite';
import PatientsSection from './PatientsSection';
import { usePatientsStore } from '../../store/patients.store';
import type { Patient } from '../../types/patient.types';

// ---------------------------------------------------------------------------
// No-op actions — el decorador withZustandStore reemplaza el estado entero
// con setState(..., true), lo que borra las acciones reales. Incluir
// versiones no-op evita que usePatientsSearch → loadPatients('') explote.
// ---------------------------------------------------------------------------
const noop = (): void => undefined;
const noopAsync = async (): Promise<void> => undefined;

function makeStoreActions() {
  return {
    loadPatients: noopAsync,
    loadNextPatientsPage: noopAsync,
    addPatient: noop,
    updatePatient: noop,
    resetStore: noop,
  };
}

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
  component: PatientsSection,
  title: 'Organisms/PatientsSection',
  tags: ['autodocs'],
  parameters: {
    zustandStore: {
      store: usePatientsStore,
      state: {
        patients: mockPatients,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        currentPage: 1,
        searchQuery: '',
        error: null,
        ...makeStoreActions(),
      },
    },
  },
} satisfies Meta<typeof PatientsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPatients: Story = {};

export const Loading: Story = {
  parameters: {
    zustandStore: {
      store: usePatientsStore,
      state: {
        patients: [],
        isLoading: true,
        isLoadingMore: false,
        hasMore: true,
        currentPage: 0,
        searchQuery: '',
        error: null,
        ...makeStoreActions(),
      },
    },
  },
};

export const Empty: Story = {
  parameters: {
    zustandStore: {
      store: usePatientsStore,
      state: {
        patients: [],
        isLoading: false,
        isLoadingMore: false,
        hasMore: true,
        currentPage: 0,
        searchQuery: '',
        error: null,
        ...makeStoreActions(),
      },
    },
  },
};

export const WithError: Story = {
  parameters: {
    zustandStore: {
      store: usePatientsStore,
      state: {
        patients: [],
        isLoading: false,
        isLoadingMore: false,
        hasMore: true,
        currentPage: 0,
        searchQuery: '',
        error: 'Failed to load patients. Please try again.',
        ...makeStoreActions(),
      },
    },
  },
};
