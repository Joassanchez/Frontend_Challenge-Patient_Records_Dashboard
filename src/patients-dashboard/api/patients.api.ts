import { request } from '../../api/apiClient';
import type { UserDto } from '../types/patient.types';
import type { Patient } from '../types/patient.types';

function mapUserDtoToPatient(dto: UserDto): Patient {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    webpage: dto.webpage,
    avatar: dto.avatar,
  };
}

export async function getPatients(): Promise<Patient[]> {
  const users = await request<UserDto[]>('/users');
  return users.map(mapUserDtoToPatient);
}
