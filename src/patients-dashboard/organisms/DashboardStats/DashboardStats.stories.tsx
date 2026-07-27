import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import DashboardStats from './DashboardStats';
import { usePatientsStore } from '@/patients-dashboard/store/patients.store';
import { useFavoritesStore } from '@/patients-dashboard/store/favorites.store';
import type { Patient } from '@/patients-dashboard/types/patient.types';

const samplePatients: Patient[] = [
  { id: '1', name: 'María García', description: 'Paciente activa', website: '', avatar: '', status: 'active', createdAt: '2025-01-01' },
  { id: '2', name: 'Carlos López', description: 'Paciente activo', website: '', avatar: '', status: 'active', createdAt: '2025-02-01' },
  { id: '3', name: 'Ana Martínez', description: 'Paciente inactiva', website: '', avatar: '', status: 'inactive', createdAt: '2025-03-01' },
  { id: '4', name: 'Pedro Sánchez', description: 'Paciente activo', website: '', avatar: '', status: 'active', createdAt: '2025-04-01' },
];

function WithData() {
  useEffect(() => {
    usePatientsStore.setState({ patients: samplePatients });
    useFavoritesStore.setState({ favoritePatientIds: ['1', '4'] });
    return () => {
      usePatientsStore.setState({ patients: [] });
      useFavoritesStore.setState({ favoritePatientIds: [] });
    };
  }, []);
  return <DashboardStats />;
}

const meta = {
  component: DashboardStats,
  title: 'Organisms/DashboardStats',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-4xl p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPatients: Story = {
  render: () => <WithData />,
};

export const Empty: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        usePatientsStore.setState({ patients: [] });
        useFavoritesStore.setState({ favoritePatientIds: [] });
      }, []);
      return <Story />;
    },
  ],
};
