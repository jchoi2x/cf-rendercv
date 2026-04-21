import { z } from "@hono/zod-openapi";

export const ReversedNumberedEntry = z
  .object({
    reversed_number: z
      .string()
      .describe(
        "Reverse-numbered list item. Numbering goes in reverse (5, 4, 3, 2, 1), making recent items have higher numbers.",
      ),
  })
  .passthrough()
  .describe("ReversedNumberedEntry");
