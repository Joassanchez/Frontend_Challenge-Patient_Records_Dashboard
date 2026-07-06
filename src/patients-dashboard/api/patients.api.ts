import { request } from '../../api/apiClient';
import type { UserDto } from '../types/patient.types';
import type { Patient } from '../types/patient.types';

type ApiPatientDto = UserDto & { webpage?: string };

function resolveWebpage(dto: ApiPatientDto): string {
  return dto.website ?? dto.webpage ?? '';
}

function mapUserDtoToPatient(dto: ApiPatientDto): Patient {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    webpage: resolveWebpage(dto),
    avatar: dto.avatar,
    createdAt: dto.createdAt,
  };
}

export async function getPatients(): Promise<Patient[]> {
  const users = await request<ApiPatientDto[]>('/users');
  return users.map(mapUserDtoToPatient);
}
