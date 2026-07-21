import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientsPage } from '@/patients-dashboard/api/patients.api';
import { request as apiRequest } from '@/api/apiClient';

vi.mock('@/api/apiClient', () => ({
  request: vi.fn(),
}));

const mockRequest = vi.mocked(apiRequest);

const buildPatient = (id: string) => ({
  id,
  name: `Patient ${id}`,
  description: `Desc ${id}`,
  website: `https://${id}.com`,
  avatar: `https://img/${id}.png`,
  createdAt: '2024-01-01',
});

describe('getPatientsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls /users with page and limit query params', async () => {
    mockRequest.mockResolvedValue([buildPatient('1')]);

    await getPatientsPage({ page: 2, limit: 5 });

    expect(mockRequest).toHaveBeenCalledWith('/users?page=2&limit=5');
  });

  it('returns Patient[] with all records when returned length equals limit (full page)', async () => {
    const mockData = [buildPatient('1'), buildPatient('2'), buildPatient('3')];
    mockRequest.mockResolvedValue(mockData);

    const result = await getPatientsPage({ page: 1, limit: 3 });

    expect(result).toEqual(mockData);
  });

  it('returns Patient[] with fewer records when returned length is less than limit (partial page)', async () => {
    const mockData = [buildPatient('1')];
    mockRequest.mockResolvedValue(mockData);

    const result = await getPatientsPage({ page: 1, limit: 3 });

    expect(result).toEqual(mockData);
  });

  it('returns [] for empty response', async () => {
    mockRequest.mockResolvedValue([]);

    const result = await getPatientsPage({ page: 1, limit: 10 });

    expect(result).toEqual([]);
  });

  it('clamps page and limit to at least 1', async () => {
    mockRequest.mockResolvedValue([]);

    await getPatientsPage({ page: 0, limit: -5 });

    expect(mockRequest).toHaveBeenCalledWith('/users?page=1&limit=1');
  });

  it('throws INVALID_RESPONSE when response is not an array', async () => {
    mockRequest.mockResolvedValue({ not: 'an-array' });
    await expect(getPatientsPage({ page: 1, limit: 10 })).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      message: expect.stringContaining('esquema'),
    });
  });

  it('throws INVALID_RESPONSE when items are missing required fields', async () => {
    mockRequest.mockResolvedValue([{ name: 'No ID' }]);
    await expect(getPatientsPage({ page: 1, limit: 10 })).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });

  it('normalizes avatar from empty object to empty string', async () => {
    mockRequest.mockResolvedValue([
      {
        id: '1',
        name: 'Ana',
        description: 'Desc',
        website: 'https://a.com',
        avatar: {},
        createdAt: '2024-01-01',
      },
    ]);
    const result = await getPatientsPage({ page: 1, limit: 10 });
    expect(result[0].avatar).toBe('');
  });

  it('throws INVALID_RESPONSE when website is not a string', async () => {
    mockRequest.mockResolvedValue([
      { id: '1', name: 'X', description: 'Y', website: 123, avatar: '' },
    ]);
    await expect(getPatientsPage({ page: 1, limit: 10 })).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });

  it('propagates HTTP_ERROR from request', async () => {
    mockRequest.mockRejectedValue({
      status: 500,
      message: 'Server Error',
      code: 'HTTP_ERROR',
    });
    await expect(getPatientsPage({ page: 1, limit: 10 })).rejects.toMatchObject({
      status: 500,
      code: 'HTTP_ERROR',
    });
  });

  it('propagates NETWORK_ERROR from request', async () => {
    mockRequest.mockRejectedValue({
      status: 0,
      message: 'Failed to fetch',
      code: 'NETWORK_ERROR',
    });
    await expect(getPatientsPage({ page: 1, limit: 10 })).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    });
  });

  // --------------------------------------------------------------------------
  // 404 → empty page (MockAPI returns 404 for no-match searches)
  // --------------------------------------------------------------------------
  describe('404 no-results mapping', () => {
    it('returns [] when request rejects with 404', async () => {
      mockRequest.mockRejectedValue({
        status: 404,
        message: 'Not Found',
        code: 'HTTP_ERROR',
      });

      const result = await getPatientsPage({ page: 1, limit: 10, search: 'nonexistent' });

      expect(result).toEqual([]);
    });

    it('still propagates 500 errors as rejections', async () => {
      mockRequest.mockRejectedValue({
        status: 500,
        message: 'Internal Server Error',
        code: 'HTTP_ERROR',
      });

      await expect(
        getPatientsPage({ page: 1, limit: 10, search: 'ana' }),
      ).rejects.toMatchObject({ status: 500, code: 'HTTP_ERROR' });
    });

    it('still propagates network errors as rejections', async () => {
      mockRequest.mockRejectedValue({
        status: 0,
        message: 'Failed to fetch',
        code: 'NETWORK_ERROR',
      });

      await expect(
        getPatientsPage({ page: 1, limit: 10 }),
      ).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
    });

    it('still propagates non-ApiError throws', async () => {
      mockRequest.mockRejectedValue(new Error('unexpected'));

      await expect(
        getPatientsPage({ page: 1, limit: 10 }),
      ).rejects.toThrow('unexpected');
    });
  });

  // --------------------------------------------------------------------------
  // Search parameter
  // --------------------------------------------------------------------------
  describe('search parameter', () => {
    it('omits search param when search is not provided', async () => {
      mockRequest.mockResolvedValue([]);

      await getPatientsPage({ page: 1, limit: 10 });

      expect(mockRequest).toHaveBeenCalledWith('/users?page=1&limit=10');
    });

    it('omits search param when search is an empty string', async () => {
      mockRequest.mockResolvedValue([]);

      await getPatientsPage({ page: 1, limit: 10, search: '' });

      expect(mockRequest).toHaveBeenCalledWith('/users?page=1&limit=10');
    });

    it('omits search param when search is only whitespace', async () => {
      mockRequest.mockResolvedValue([]);

      await getPatientsPage({ page: 1, limit: 10, search: '   ' });

      expect(mockRequest).toHaveBeenCalledWith('/users?page=1&limit=10');
    });

    it('includes search param when non-empty', async () => {
      mockRequest.mockResolvedValue([]);

      await getPatientsPage({ page: 1, limit: 10, search: 'ana' });

      expect(mockRequest).toHaveBeenCalledWith(
        '/users?page=1&limit=10&search=ana',
      );
    });

    it('trims the search value before encoding', async () => {
      mockRequest.mockResolvedValue([]);

      await getPatientsPage({ page: 1, limit: 10, search: '  ana  ' });

      expect(mockRequest).toHaveBeenCalledWith(
        '/users?page=1&limit=10&search=ana',
      );
    });

    it('URL-encodes special characters in search', async () => {
      mockRequest.mockResolvedValue([]);

      await getPatientsPage({ page: 1, limit: 10, search: 'ana maría' });

      // URLSearchParams encodes spaces as '+' by default.
      expect(mockRequest).toHaveBeenCalledWith(
        expect.stringMatching(/^\/users\?page=1&limit=10&search=ana/),
      );
      const calledUrl = mockRequest.mock.calls[0][0] as string;
      const params = new URLSearchParams(calledUrl.slice('/users?'.length));
      expect(params.get('search')).toBe('ana maría');
    });
  });
});
