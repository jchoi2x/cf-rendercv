import { RendercvDo, DockerRendercvApp } from './durable';
import { Hono } from 'hono';
import { TRenderCvDocument } from '@cf-rendercv/contracts/entities';

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.json({ message: 'OK' }));
app.post('*', async (c) => {
  const clonedRequest = c.req.raw.clone();
  const body = await c.req.json();
  const { success, data, error } = TRenderCvDocument.safeParse(body);
  if (!success) {
    console.log({
      error,
      success,
      data,
    })
    return c.json({ error: error.message }, 400);
  }

  const request = new Request(clonedRequest, {
    body: JSON.stringify(body),
  })
 
  const id = c.env.MCP_OBJECT.idFromName('rendercv');
  const subject = c.env.MCP_OBJECT.get(id);
  const response = await subject.fetch(request);
  return response;
})

export default app;
export { RendercvDo, DockerRendercvApp };