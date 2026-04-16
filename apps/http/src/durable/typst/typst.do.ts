import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";

import { Templater } from "../templating/templater";
import { TypstCompilerManager } from "./typst-compiler-manager/typst-compiler-manager";

export class TypstCompilerDo extends DurableObject<Env> {
  private readonly templater = new Templater();
  private readonly compilerManager = new TypstCompilerManager();
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.app.onError((error, c) => {
      console.error("[TypstCompilerDO] unhandled route error:", error);
      const message = error instanceof Error ? error.message : String(error);
      return c.json({ ok: false, error: message }, 500);
    });

    this.app.post("/api/v2/generate", async (c) => {
      try {
        const payload = await c.req.json();
        const source = await this.templater.buildTypstSource(payload);
        // return c.json({ ok: true, source });
        return await this.compilerManager.compilePdfResponse(5, source);
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
