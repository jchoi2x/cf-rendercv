import { z } from "@hono/zod-openapi";

import { ArbitraryDate } from "../common/arbitrary-date";
import { ExactDate } from "../common/exact-date";

export const ExperienceEntry = z
  .object({
    company: z.string().describe("Company"),
    position: z.string().describe("Position"),
    date: z
      .union([ArbitraryDate, z.null()])
      .describe(
        "The date of this event in YYYY-MM-DD, YYYY-MM, or YYYY format, or any custom text like 'Fall 2023'. Use this for single-day or imprecise dates. For date ranges, use `start_date` and `end_date` instead.",
      )
      .default(null)
      .optional(),
    start_date: z
      .union([ExactDate, z.null()])
      .describe("The start date in YYYY-MM-DD, YYYY-MM, or YYYY format.")
      .default(null)
      .optional(),
    end_date: z
      .union([ExactDate, z.literal("present"), z.null()])
      .describe(
        'The end date in YYYY-MM-DD, YYYY-MM, or YYYY format. Use "present" for ongoing events, or omit it to indicate the event is ongoing.',
      )
      .default(null)
      .optional(),
    location: z
      .union([z.string(), z.null()])
      .describe("Location")
      .default(null)
      .optional(),
    summary: z
      .union([z.string(), z.null()])
      .describe("Summary")
      .default(null)
      .optional(),
    highlights: z
      .union([z.array(z.string()), z.null()])
      .describe(
        "Bullet points for key achievements, responsibilities, or contributions.",
      )
      .default(null)
      .optional(),
  })
  .passthrough()
  .describe("ExperienceEntry");
