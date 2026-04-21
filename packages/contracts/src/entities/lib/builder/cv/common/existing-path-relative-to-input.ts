import { z } from "@hono/zod-openapi";

export const ExistingPathRelativeToInput = z
  .string()
  .min(1)
  .describe("Existing path relative to the input file.");
