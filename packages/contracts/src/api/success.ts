import { z } from 'zod';

export const GenerateSuccessSchema = z.object({
  success: z.literal(true).describe('Request validated successfully'),
  message: z.string().optional().describe('Optional status message'),
});

export type GenerateSuccess = z.infer<typeof GenerateSuccessSchema>;