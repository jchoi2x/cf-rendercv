import { z } from "zod";

export const ErrorResponseSchema = z.object({
  success: z.literal(false).optional(),
  error: z.string().describe("Error type or message"),
  details: z
    .unknown()
    .optional()
    .describe("Validation or server error details"),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
