import { z } from "@hono/zod-openapi";
export const NumberedEntry = z
  .object({
    number: z.string().describe("Number"),
  })
  .passthrough()
  .describe("NumberedEntry");
