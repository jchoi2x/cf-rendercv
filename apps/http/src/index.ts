import { RendercvDo, DockerRendercvApp } from './durable';
import { Hono } from 'hono';
import { RenderCvDocument } from '@cf-rendercv/contracts/entities';
import { showRoutes } from 'hono/dev';

const app = new Hono<{ Bindings: Env }>();


app.get('/health', (c) => c.json({ message: 'OK' }));
app.use('/sse*', (c) => {
  return RendercvDo.serveSSE('/sse').fetch(c.req.raw, c.env, c.executionCtx as ExecutionContext<unknown>);
});

app.use('/mcp', (c) => {
  return RendercvDo.serve('/mcp').fetch(c.req.raw, c.env, c.executionCtx as ExecutionContext<unknown>);
});

app.all('*', async (c) => {
  const clonedRequest = c.req.raw.clone();

  let request = new Request(clonedRequest, {})

  if (c.req.raw.method === 'POST') { 
    const body = await c.req.json();
    const { success, data, error } = RenderCvDocument.safeParse(body);
    if (!success) {
      console.error({
        error,
        success,
        data,
      })
      return c.json({ error: error.message }, 400);
    }

    request = new Request(request, {
      body: JSON.stringify(body),
    });
  }

  const id = c.env.MCP_OBJECT.idFromName('rendercv');

  const stub = c.env.MCP_OBJECT.get(id);
  const subject = await stub.fetch(request);
  return subject;
});

showRoutes(app);
export default app;
export { RendercvDo, DockerRendercvApp };