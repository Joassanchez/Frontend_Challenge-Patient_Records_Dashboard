import type { Meta, StoryObj } from '@storybook/react-vite';
import PatientModal from './PatientModal';
import { useModalStore } from '../../store/modal.store';
import { usePatientsStore } from '../../store/patients.store';
import { useToastStore } from '../../store/toast.store';
import type { Patient } from '../../types/patient.types';

const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Ana García',
    description: 'Paciente de neurología',
    website: 'https://example.com/ana',
    avatar: 'https://i.pravatar.cc/150?u=ana',
    createdAt: '2024-01-15T10:30:00Z',
  },
];

const meta = {
  component: PatientModal,
  title: 'Organisms/PatientModal',
  tags: ['autodocs'],
  parameters: {
    zustandStore: [
      {
        store: useModalStore,
        state: { isOpen: true, mode: 'create', selectedPatientId: null },
      },
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
        store: useToastStore,
        state: { toasts: [] },
      },
    ],
  },
} satisfies Meta<typeof PatientModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = {
  parameters: {
    zustandStore: [
      {
        store: useModalStore,
        state: { isOpen: true, mode: 'edit', selectedPatientId: 'p1' },
      },
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
        store: useToastStore,
        state: { toasts: [] },
      },
    ],
  },
};

export const Closed: Story = {
  parameters: {
    zustandStore: [
      {
        store: useModalStore,
        state: { isOpen: false, mode: 'create', selectedPatientId: null },
      },
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
        store: useToastStore,
        state: { toasts: [] },
      },
    ],
  },
};
