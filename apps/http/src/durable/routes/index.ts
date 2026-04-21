import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";

import { generateRoute } from "./generate";
import type { RenderCvMcpAgent } from "../types";
import { generateSwaggerHtml } from "./helpers/generate-swagger-html";
import { typstRoute } from "./typst";

export const getApp = (agent: RenderCvMcpAgent): Hono<{ Bindings: Env }> => {
  const app = new OpenAPIHono<{ Bindings: Env }>();

  app.use("*", logger());

  // Health check
  app.get("/health", (c) => {
    return c.json({
      message: "OK",
    });
  });

  // OpenAPI documentation
  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      version: "1.1.0",
      title: "RenderCV API",
      description: "Use API render resumes using RenderCV.",
    },
    servers: [],
  });

  app.get(
    "/swagger-ui",
    swaggerUI({
      url: "/openapi.json",
      plugins: [],
      manuallySwaggerUIHtml: generateSwaggerHtml,
    }),
  );

  app.openapi(generateRoute, async (c) => {
    try {
      const result = await agent.renderCvTypstPdf(await c.req.text());

      if (!result.ok) {
        return c.json({ ok: false, error: result.error }, 500);
      }

      return new Response(result.pdf, {
        headers: {
          "content-type": "application/pdf",
        },
      });
    } catch (error) {
      console.error("[RendercvDO] /api/v3/rendercv/render failed:", error);
      const message = error instanceof Error ? error.message : String(error);
      return c.json({ ok: false, error: message }, 500);
    }
  });

  app.openapi(typstRoute, async (c) => {
    try {
      const result = await agent.renderCvTypstSource(await c.req.text());

      if (!result.ok) {
        return c.json({ ok: false, error: result.error }, 500);
      }

      return new Response(result.source.trimEnd(), {
        headers: {
          "content-type": "application/text; charset=utf-8",
        },
      });
    } catch (error) {
      console.error("[RendercvDO] /api/v3/rendercv/typst failed:", error);
      const message = error instanceof Error ? error.message : String(error);
      return c.json({ ok: false, error: message }, 500);
    }
  });

  showRoutes(app);
  return app;
};
