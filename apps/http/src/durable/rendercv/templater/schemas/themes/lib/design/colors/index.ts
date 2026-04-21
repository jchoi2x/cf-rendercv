import { z } from "@hono/zod-openapi";

export interface Colors {
  body?: string;
  name?: string;
  headline?: string;
  connections?: string;
  section_titles?: string;
  links?: string;
  footer?: string;
  top_note?: string;
}

const designColor = z.string()
  .describe("The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0, 79, 144)`.");

export const getColors = (defaults: Colors) => {
  return z.object({
    body: designColor
      .default(defaults.body ?? 'rgb(0, 0, 0)'),
    name: designColor
      .default(defaults.name ?? 'rgb(0, 79, 144)'),
    headline: designColor
      .default(defaults.headline ?? 'rgb(0, 79, 144)'),
    connections: designColor
      .default(defaults.connections ?? 'rgb(0, 79, 144)'),
    section_titles: designColor
      .default(defaults.section_titles ?? 'rgb(0, 79, 144)'),
    links: designColor
      .default(defaults.links ?? 'rgb(0, 79, 144)'),
    footer: designColor
      .default(defaults.footer ?? 'rgb(128, 128, 128)'),
    top_note: designColor
      .default(defaults.top_note ?? 'rgb(128, 128, 128)'),
  });
}
