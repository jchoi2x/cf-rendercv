import { z } from "@hono/zod-openapi";


export interface FontSize {
  body?: string;
  name?: string;
  headline?: string;
  connections?: string;
  section_titles?: string; 
}


export const getFontSize = (defaults: FontSize) => {
  return z.object({
    body: z.string()
      .default(defaults.body ?? '10pt')
      .describe("The font size for body text. The default value is `10pt`."),
    name: z.string()
      .default(defaults.name ?? '30pt')
      .describe("The font size for the name. The default value is `30pt`."),
    headline: z.string()
      .default(defaults.headline ?? '10pt')
      .describe("The font size for the headline. The default value is `10pt`."),
    connections: z.string()
      .default(defaults.connections ?? '10pt')
      .describe("The font size for connections. The default value is `10pt`."),
    section_titles: z.string()
      .default(defaults.section_titles ?? '1.4em')
      .describe("The font size for section titles. The default value is `1.4em`."),
  });
}
