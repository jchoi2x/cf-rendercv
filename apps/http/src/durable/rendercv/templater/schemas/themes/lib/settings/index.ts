import { z } from "@hono/zod-openapi";

export const getSettingsSchema = () => {
  return z.object({
    current_date: z.string().default("today"),
    render_command: z.object({}).default({}),
    bold_keywords: z.array(z.string()).default([]),
    pdf_title: z.string().default("NAME - CV"),
  });
}