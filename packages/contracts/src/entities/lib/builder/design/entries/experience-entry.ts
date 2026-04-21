import { z } from "@hono/zod-openapi";

const ArbitraryDate = z.union([z.number().int(), z.string()]);
const ExactDate = z.union([z.string(), z.number().int()]);

export const ExperienceEntry = z
  .object({
    company: z.string().describe("Company"),
    position: z.string().describe("Position"),
    date: z.union([ArbitraryDate, z.null()]).default(null).optional(),
    start_date: z.union([ExactDate, z.null()]).default(null).optional(),
    end_date: z
      .union([ExactDate, z.literal("present"), z.null()])
      .default(null)
      .optional(),
    location: z.union([z.string(), z.null()]).default(null).optional(),
    summary: z.union([z.string(), z.null()]).default(null).optional(),
    highlights: z
      .union([z.array(z.string()), z.null()])
      .default(null)
      .optional(),
  })
  .passthrough()
  .describe("ExperienceEntry");
