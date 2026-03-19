import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('rendercv-app wiring', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('covers generateSwaggerHtml helper', async () => {
    const { generateSwaggerHtml } = await import('../helpers/generate-swagger-html');
    const html = generateSwaggerHtml({ css: ['a.css'], js: ['b.js'] } as any);
    expect(html).toContain('<link rel="stylesheet" href="a.css" />');
    expect(html).toContain('<script src="b.js"');
    expect(html).toContain('PdfPlugin');
  });

  it('imports src/index.ts without starting a real server', async () => {
    const serveMock = vi.fn((_opts: any, cb?: () => void) => {
      cb?.();
      return { close: vi.fn() };
    });
    const showRoutesMock = vi.fn();

    vi.doMock('@hono/node-server', () => ({ serve: serveMock }));
    vi.doMock('hono/dev', () => ({ showRoutes: showRoutesMock }));
    vi.doMock('@/routes', async () => {
      const actual = await vi.importActual<any>('../routes/index');
      return { ...actual, __junk_export: 123 };
    });
    vi.spyOn(console, 'info').mockImplementation(() => {});

    const mod = await import('../index');
    expect(mod.default).toBeDefined();
    expect(serveMock).toHaveBeenCalledTimes(1);
    expect(showRoutesMock).toHaveBeenCalledTimes(1);

    const app = mod.default as any;
    const health = await app.fetch(new Request('http://localhost/health'));
    expect(health.status).toBe(200);

    const root = await app.fetch(new Request('http://localhost/'));
    expect(root.status).toBe(302);
    expect(root.headers.get('location')).toBe('/swagger-ui');
  });

  it('covers routes barrel export', async () => {
    const routes = await import('../routes/index');
    expect(routes.generateRoute).toBeDefined();
    expect(routes.__routes_barrel_loaded).toBe(true);
  });
});

