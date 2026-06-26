import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request } from './apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('request<T>() returns typed JSON response on ok', async () => {
    const mockData = { id: '1', name: 'Test' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockData),
    });

    const result = await request<typeof mockData>('/test');

    expect(result).toEqual(mockData);
  });

  it('request<T>() throws ApiError with status and message on non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve(null),
    });

    await expect(request('/missing')).rejects.toEqual({
      status: 404,
      message: 'Not Found',
    });
  });

  it('request<T>() passes options through to fetch', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
    });

    await request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x: 1 }),
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
