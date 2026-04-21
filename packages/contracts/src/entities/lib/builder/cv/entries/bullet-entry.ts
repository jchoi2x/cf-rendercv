import { z } from "@hono/zod-openapi";

export const BulletEntry = z
  .object({
    bullet: z.string().describe("Bullet"),
  })
  .describe("BulletEntry")
  .passthrough();
