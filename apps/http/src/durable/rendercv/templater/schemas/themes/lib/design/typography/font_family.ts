import { z } from "@hono/zod-openapi";


const fontFamiliesVal =  [
  "DejaVu Sans Mono" ,
  "EB Garamond",
  "Fontin",
  "Gentium Book Plus",
  "Lato",
  "Libertinus Serif",
  "Mukta",
  "New Computer Modern",
  "Noto Sans",
  "Open Sans",
  "Open Sauce Sans",
  "Poppins",
  "Raleway",
  "Roboto",
  "Source Sans 3",
  "Ubuntu",
  "XCharter"
] as const;

const fontFamilies = z.enum(fontFamiliesVal);

type FontFamilyType = z.infer<typeof fontFamilies>;


export type FontFamily = {
  body?: FontFamilyType;
  name?: FontFamilyType;
  headline?: FontFamilyType;
  connections?: FontFamilyType;
  section_titles?: FontFamilyType;
}


export const getFontFamily = (defaults: FontFamily) => {
  return z.object({
    body: z.string()
      .default(defaults.body ?? 'Source Sans 3')
      .describe("The font family for body text. The default value is `Source Sans 3`."),
    name: z.string()
      .default(defaults.name ?? 'Source Sans 3')
      .describe("The font family for the name. The default value is `Source Sans 3`."),
    headline: z.string()
      .default(defaults.headline ?? 'Source Sans 3')
      .describe("The font family for the headline. The default value is `Source Sans 3`."),
    connections: z.string()
      .default(defaults.connections ?? 'Source Sans 3')
      .describe("The font family for connections. The default value is `Source Sans 3`."),
    section_titles: z.string()
      .default(defaults.section_titles ?? 'Source Sans 3')
      .describe("The font family for section titles. The default value is `Source Sans 3`."),
  });
};



