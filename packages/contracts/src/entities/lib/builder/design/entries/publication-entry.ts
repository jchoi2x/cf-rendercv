import { z } from "@hono/zod-openapi";

const ArbitraryDate = z.union([z.number().int(), z.string()]);

export const PublicationEntry = z
  .object({
    title: z.string().describe("Title"),
    authors: z
      .array(z.string())
      .describe("You can bold your name with **double asterisks**."),
    summary: z.union([z.string(), z.null()]).default(null).optional(),
    doi: z.union([z.string(), z.null()]).default(null).optional(),
    url: z
      .union([z.string().url().min(1).max(2083), z.null()])
      .default(null)
      .optional(),
    journal: z.union([z.string(), z.null()]).default(null).optional(),
    date: z.union([ArbitraryDate, z.null()]).default(null).optional(),
  })
  .passthrough()
  .describe("PublicationEntry");
