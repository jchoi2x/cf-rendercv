import { z } from "@hono/zod-openapi";

export const BulletEntry = z
  .object({
    bullet: z.string().describe("Bullet"),
  })
  .passthrough()
  .describe("BulletEntry");
