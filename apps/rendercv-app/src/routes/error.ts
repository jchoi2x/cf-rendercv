import { z } from '@hono/zod-openapi';

/**
 * Error response schema
 */
export const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ 
      example: 'Internal server error',
      description: 'Error message describing what went wrong'
    }),
  })
  .openapi('ErrorResponse');

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
