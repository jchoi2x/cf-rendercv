import { z } from "@hono/zod-openapi";

export const OneLineEntry = z
  .object({
    label: z.string().describe("Label"),
    details: z.string().describe("Details"),
  })
  .describe("OneLineEntry");
