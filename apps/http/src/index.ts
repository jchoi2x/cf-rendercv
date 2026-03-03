import { RendercvDo, DockerRendercvApp } from './durable';
import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.json({ message: 'OK' }));
app.post('*', async (c) => {
  const id = c.env.MCP_OBJECT.idFromName('');
  const subject = c.env.MCP_OBJECT.get(id);
  const response = await subject.fetch(c.req.raw);
  return response;
})

export default app;
export { RendercvDo, DockerRendercvApp };