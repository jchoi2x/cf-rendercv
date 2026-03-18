import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { showRoutes } from 'hono/dev';
import { logger } from 'hono/logger';

import * as routes from '@/routes';
import type { Env } from './types';

const port = Number(process.env.PORT) || 8080;

const app = new OpenAPIHono<Env>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    message: 'OK',
  });
});

// Swagger UI
app.get('/swagger-ui', swaggerUI({ url: '/openapi.json' }));

// OpenAPI documentation
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '1.1.0',
    title: 'Suno API',
    description: 'Use API to call the music generation service of suno.ai, and easily integrate it into agents like GPTs.',
  },
  servers: [
    {
      url: `http://0.0.0.0:${port}`,
      description: 'Local server',
    },
  ],
});


// Register routes dynamically on the sub-app
type P = Parameters<typeof app.openapi>;
type R = P[0];
type H = P[1];
const r = routes as unknown as Record<string, { route: R; handler: H }>;




Object.keys(r).forEach((route) => {
  if (r[route] && typeof r[route] === 'object' && 'route' in r[route] && 'handler' in r[route]) {
    app.openapi(r[route].route, r[route].handler);
  }
});


// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Suno API Server',
    version: '1.1.0',
    docs: '/swagger-ui',
  });
});

// Export app for testing
export default app;

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
}, () => {
  console.info(`Server is running on port ${port}`);
  showRoutes(app, {
    verbose: false,
  });
});

