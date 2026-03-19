import { describe, it, expect, vi, beforeEach } from 'vitest';

const getContainerMock = vi.fn();

vi.mock('@cloudflare/containers', () => ({
  getContainer: (...args: unknown[]) => getContainerMock(...args),
}));

describe('callContainerService', () => {
  let callContainerService: typeof import('../call-container').callContainerService;

  beforeEach(async () => {
    getContainerMock.mockReset();
    callContainerService = (await import('../call-container')).callContainerService;
  });

  it('forwards POST JSON body (stringifies object)', async () => {
    const fetchMock = vi.fn(async (request: Request) => {
      const receivedBody = await request.text();
      return new Response(receivedBody, { status: 200 });
    });

    getContainerMock.mockReturnValue({
      fetch: fetchMock,
    });

    const res = await callContainerService({
      path: '/api/v1/generate',
      method: 'POST',
      body: { name: 'Alice' },
      name: 'rendercv-app',
    });

    expect(getContainerMock).toHaveBeenCalledWith('docker-rendercv-app', 'rendercv-app');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const request = fetchMock.mock.calls[0]?.[0] as Request;
    expect(request.method).toBe('POST');
    expect(request.url).toBe('http://container/api/v1/generate');
    expect(request.headers.get('Content-Type')).toBe('application/json');

    // Note: request.text() can only be read once; we validate via the response body.
    expect(await res.text()).toBe(JSON.stringify({ name: 'Alice' }));
    expect(res.status).toBe(200);
  });

  it('does not send body for GET requests', async () => {
    const fetchMock = vi.fn(async (request: Request) => new Response(await request.text(), { status: 200 }));
    getContainerMock.mockReturnValue({ fetch: fetchMock });

    const res = await callContainerService({
      path: '/openapi.json',
      method: 'GET',
      body: { anything: true },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await res.text()).toBe('');
  });

  it('passes through string body without re-stringifying', async () => {
    const fetchMock = vi.fn(async (request: Request) => new Response(await request.text(), { status: 200 }));
    getContainerMock.mockReturnValue({ fetch: fetchMock });

    const res = await callContainerService({
      path: '/api/v1/generate',
      method: 'POST',
      body: '{"name":"Alice"}',
    });

    expect(await res.text()).toBe('{"name":"Alice"}');
  });

  it('wraps downstream errors with a helpful message', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('boom');
    });
    getContainerMock.mockReturnValue({ fetch: fetchMock });

    await expect(
      callContainerService({
        path: '/api/v1/generate',
        method: 'POST',
        body: { name: 'Alice' },
      }),
    ).rejects.toThrow('Failed to call container service: boom');
  });
});

