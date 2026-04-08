import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';

const rimrafSyncMock = vi.fn();
const execSyncMock = vi.fn();
const mkdirSyncMock = vi.fn();
const writeFileSyncMock = vi.fn();
const createReadStreamMock = vi.fn();

const RenderCvDocumentMock = z.object({
  name: z.string(),
});

vi.mock('@cf-rendercv/contracts', () => ({
  RenderCvDocument: RenderCvDocumentMock,
  ErrorResponseSchema: z.any(),
  GenerateSuccessSchema: z.any(),
}));

vi.mock('rimraf', () => ({
  rimrafSync: (...args: unknown[]) => rimrafSyncMock(...args),
}));

vi.mock('node:child_process', () => ({
  execSync: (...args: unknown[]) => execSyncMock(...args),
}));

vi.mock('node:fs', () => ({
  mkdirSync: (...args: unknown[]) => mkdirSyncMock(...args),
  writeFileSync: (...args: unknown[]) => writeFileSyncMock(...args),
  createReadStream: (...args: unknown[]) => createReadStreamMock(...args),
}));

describe('generateRoute.handler', () => {
  let app: OpenAPIHono;
  let handler: (typeof import('../generate'))['generateRoute']['handler'];

  beforeEach(async () => {
    rimrafSyncMock.mockReset();
    execSyncMock.mockReset();
    mkdirSyncMock.mockReset();
    writeFileSyncMock.mockReset();
    createReadStreamMock.mockReset();

    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      'uuid-123' as unknown as `${string}-${string}-${string}-${string}-${string}`,
    );

    const { generateRoute } = await import('../generate');
    app = new OpenAPIHono();
    app.openapi(generateRoute.route, generateRoute.handler);
    handler = generateRoute.handler;
  });

  it('rejects unsupported content-type with 415', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/v1/generate', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain',
        },
        body: 'hello',
      }),
    );

    expect(res.status).toBe(415);
    const json = await res.json();
    expect(json.error).toMatch(/Unsupported content-type/i);
  });

  it('rejects missing content-type with 415 and helpful message', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/v1/generate', {
        method: 'POST',
      }),
    );

    expect(res.status).toBe(415);
    const json = await res.json();
    expect(json.error).toMatch(/\(missing\)/i);
  });

  it('returns 400 when YAML fails RenderCvDocument validation', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/v1/generate', {
        method: 'POST',
        headers: {
          'content-type': 'application/yaml',
        },
        body: 'name: 123',
      }),
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Validation error');
  });

  it('accepts valid YAML payload', async () => {
    execSyncMock.mockReturnValue(Buffer.from('ok'));

    createReadStreamMock.mockImplementation(() => {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('%PDF-1.4'));
          controller.close();
        },
      });
      return stream as unknown as ReadableStream;
    });

    const res = await app.fetch(
      new Request('http://localhost/api/v1/generate', {
        method: 'POST',
        headers: {
          'content-type': 'application/yaml',
        },
        body: 'name: Alice',
      }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('runs rendercv command for valid JSON payload', async () => {
    execSyncMock.mockReturnValue(Buffer.from('ok'));

    createReadStreamMock.mockImplementation(() => {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('%PDF-1.4'));
          controller.close();
        },
      });
      return stream as unknown as ReadableStream;
    });

    const res = await app.fetch(
      new Request('http://localhost/api/v1/generate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Alice' }),
      }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');

    expect(rimrafSyncMock).toHaveBeenCalledWith('/tmp/rendercv_output');
    expect(mkdirSyncMock).toHaveBeenCalledWith('/tmp/rendercv_output/uuid-123', {
      recursive: true,
    });
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      '/tmp/rendercv_output/uuid-123/resume.yaml',
      expect.any(String),
    );

    const execArg = execSyncMock.mock.calls[0]?.[0] as string | undefined;
    expect(execArg).toMatch(/rendercv render/);
    expect(execArg).toMatch(/resume\.yaml/);

    expect(createReadStreamMock).toHaveBeenCalledWith(
      '/tmp/rendercv_output/uuid-123/resume.pdf',
    );
  });

  it('does not log debug output when execSync returns empty', async () => {
    execSyncMock.mockReturnValue(undefined);
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    createReadStreamMock.mockImplementation(() => {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('%PDF-1.4'));
          controller.close();
        },
      });
      return stream as unknown as ReadableStream;
    });

    const res = await app.fetch(
      new Request('http://localhost/api/v1/generate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Alice' }),
      }),
    );

    expect(res.status).toBe(200);
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('returns 400 when rendercv reports input errors', async () => {
    execSyncMock.mockImplementation(() => {
      const err = new Error('render failed') as any;
      err.stdout = Buffer.from('errors in the input file!');
      err.stderr = Buffer.from('bad');
      throw err;
    });

    const res = await app.fetch(
      new Request('http://localhost/api/v1/generate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Alice' }),
      }),
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.details).toMatch(/errors in the input file!/i);
  });

  it('returns 500 when rendercv fails unexpectedly', async () => {
    execSyncMock.mockImplementation(() => {
      const err = new Error('boom') as any;
      err.stdout = Buffer.from('some other failure');
      err.stderr = Buffer.from('bad');
      throw err;
    });

    const res = await app.fetch(
      new Request('http://localhost/api/v1/generate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Alice' }),
      }),
    );

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/boom|RenderCV render failed/);
  });

  it('returns 500 with fallback message when error has no message', async () => {
    execSyncMock.mockImplementation(() => {
      const err = { stdout: Buffer.from('nope'), stderr: Buffer.from('bad') } as any;
      throw err;
    });

    const res = await app.fetch(
      new Request('http://localhost/api/v1/generate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Alice' }),
      }),
    );

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('RenderCV render failed');
  });

  it('returns 500 with empty details when stdout is missing', async () => {
    execSyncMock.mockImplementation(() => {
      throw new Error('no stdout');
    });

    const res = await app.fetch(
      new Request('http://localhost/api/v1/generate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Alice' }),
      }),
    );

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.details).toBe('');
  });
});

