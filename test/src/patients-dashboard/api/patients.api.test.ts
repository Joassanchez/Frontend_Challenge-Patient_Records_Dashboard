import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatients } from '@/patients-dashboard/api/patients.api';
import { request as apiRequest } from '@/api/apiClient';

vi.mock('@/api/apiClient', () => ({
  request: vi.fn(),
}));

const mockRequest = vi.mocked(apiRequest);

describe('getPatients', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns Patient[] on valid API response', async () => {
    const mockData = [
      {
        id: '1', name: 'Ana', description: 'Desc A',
        website: 'https://a.com', avatar: 'https://img/a.png',
        createdAt: '2024-01-01',
      },
      {
        id: '2', name: 'Juan', description: 'Desc J',
        website: 'https://j.com', avatar: 'https://img/j.png',
        createdAt: '2024-02-01',
      },
    ];
    mockRequest.mockResolvedValue(mockData);

    const patients = await getPatients();

    expect(mockRequest).toHaveBeenCalledWith('/users');
    expect(patients).toEqual(mockData);
    expect(patients).toHaveLength(2);
  });

  it('returns empty array for empty API response', async () => {
    mockRequest.mockResolvedValue([]);
    const patients = await getPatients();
    expect(patients).toEqual([]);
  });

  it('throws INVALID_RESPONSE when response is not an array', async () => {
    mockRequest.mockResolvedValue({ not: 'an-array' });
    await expect(getPatients()).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      message: expect.stringContaining('esquema'),
    });
  });

  it('throws INVALID_RESPONSE when items are missing required fields', async () => {
    mockRequest.mockResolvedValue([{ name: 'No ID' }]);
    await expect(getPatients()).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });

  it('normalizes avatar from empty object to empty string', async () => {
    mockRequest.mockResolvedValue([
      {
        id: '1', name: 'Ana', description: 'Desc',
        website: 'https://a.com', avatar: {}, createdAt: '2024-01-01',
      },
    ]);
    const patients = await getPatients();
    expect(patients[0].avatar).toBe('');
  });

  it('throws INVALID_RESPONSE when website is not a string', async () => {
    mockRequest.mockResolvedValue([
      { id: '1', name: 'X', description: 'Y', website: 123, avatar: '' },
    ]);
    await expect(getPatients()).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });

  it('propagates HTTP_ERROR from request', async () => {
    mockRequest.mockRejectedValue({
      status: 500, message: 'Server Error', code: 'HTTP_ERROR',
    });
    await expect(getPatients()).rejects.toMatchObject({
      status: 500, code: 'HTTP_ERROR',
    });
  });

  it('propagates NETWORK_ERROR from request', async () => {
    mockRequest.mockRejectedValue({
      status: 0, message: 'Failed to fetch', code: 'NETWORK_ERROR',
    });
    await expect(getPatients()).rejects.toMatchObject({
      status: 0, code: 'NETWORK_ERROR',
    });
  });
});
