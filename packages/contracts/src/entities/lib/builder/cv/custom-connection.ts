import { z } from "@hono/zod-openapi";

export const CustomConnection = z
  .object({
    fontawesome_icon: z.string().describe("Fontawesome Icon"),
    placeholder: z.string().describe("Placeholder"),
    url: z.union([z.string().url().min(1).max(2083), z.null()]).describe("Url"),
  })
  .strict()
  .describe("CustomConnection");
