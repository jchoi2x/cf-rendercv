import { z } from '@hono/zod-openapi';

// export const GenerateSuccessSchema = z.object({
//   success: z.literal(true).describe('Request validated successfully'),
//   message: z.string().optional().describe('Optional status message'),
//   url: z.string().describe('URL of the generated PDF'),
//   filename: z.string().describe('Filename of the generated PDF'),
// });
export const GenerateSuccessSchema = z.string().openapi({
  type: 'string',
  format: 'binary',
  description: 'The generated PDF',
});

export type GenerateSuccess = z.infer<typeof GenerateSuccessSchema>;