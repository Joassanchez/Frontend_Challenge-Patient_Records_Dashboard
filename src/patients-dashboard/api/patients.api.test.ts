import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatients } from './patients.api';
import type { UserDto } from '../types/patient.types';
import { request as apiRequest } from '../../api/apiClient';

vi.mock('../../api/apiClient', () => ({
  request: vi.fn(),
}));

const mockRequest = vi.mocked(apiRequest);

describe('getPatients', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns mapped Patient[] on successful fetch, keeping createdAt', async () => {
    const mockUsers: UserDto[] = [
      {
        id: '1',
        name: 'Ana',
        description: 'Desc A',
        webpage: 'https://a.com',
        avatar: 'https://img/a.png',
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        name: 'Juan',
        description: 'Desc J',
        webpage: 'https://j.com',
        avatar: 'https://img/j.png',
        createdAt: '2024-02-01',
      },
    ];

    mockRequest.mockResolvedValue(mockUsers);

    const patients = await getPatients();

    expect(mockRequest).toHaveBeenCalledWith('/users');
    expect(patients).toHaveLength(2);
    expect(patients[0]).toEqual({
      id: '1',
      name: 'Ana',
      description: 'Desc A',
      webpage: 'https://a.com',
      avatar: 'https://img/a.png',
      createdAt: '2024-01-01',
    });
    expect(patients[1]).toEqual({
      id: '2',
      name: 'Juan',
      description: 'Desc J',
      webpage: 'https://j.com',
      avatar: 'https://img/j.png',
      createdAt: '2024-02-01',
    });
  });

  it('returns empty array for empty API response', async () => {
    mockRequest.mockResolvedValue([]);

    const patients = await getPatients();

    expect(patients).toEqual([]);
  });

  it('propagates HTTP_ERROR from request', async () => {
    const apiError = {
      status: 500,
      message: 'Server Error',
      code: 'HTTP_ERROR',
    };
    mockRequest.mockRejectedValue(apiError);

    await expect(getPatients()).rejects.toEqual(apiError);
  });

  it('propagates NETWORK_ERROR from request', async () => {
    const networkError = {
      status: 0,
      message: 'Failed to fetch',
      code: 'NETWORK_ERROR',
    };
    mockRequest.mockRejectedValue(networkError);

    await expect(getPatients()).rejects.toMatchObject(networkError);
  });
});
