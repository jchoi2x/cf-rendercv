import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import type { z } from "zod";

import type { RenderCvDocument } from "@cf-rendercv/contracts";

import { compileRenderCvTypstSource } from "../templating";

export class TypstCompilerDo extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.initServer();
  }

  private initServer() {
    this.app.onError((error, c) => {
      console.error("[TypstCompilerDO] unhandled route error:", error);
      const message = error instanceof Error ? error.message : String(error);
      return c.json({ ok: false, error: message }, 500);
    });

    this.app.post("/api/v2/generate", async (c) => {
      try {
        const payload =
          await c.req.json<Required<z.infer<typeof RenderCvDocument>>>();
        const result = await compileRenderCvTypstSource(payload);
        return c.json(result);
      } catch (error) {
        console.error("[TypstCompilerDO] /api/v2/generate failed:", error);
        const message = error instanceof Error ? error.message : String(error);
        return Response.json({ ok: false, error: message }, { status: 500 });
      }
    });
  }

  app = new Hono<{ Bindings: Env }>();

  async fetch(request: Request): Promise<Response> {
    return this.app.fetch(request);
  }
}
