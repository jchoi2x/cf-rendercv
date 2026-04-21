import { z } from "@hono/zod-openapi";


export interface Links {
  underline?: boolean;
  show_external_link_icon?: boolean;
}

export const getLinks = (defaults: Links) => {
  return z.object({
    underline: z.boolean()
      .default(defaults.underline ?? false)
      .describe("Underline hyperlinks. The default value is `false`."),
    show_external_link_icon: z.boolean()
      .default(defaults.show_external_link_icon ?? false)
      .describe("Show an external link icon next to URLs. The default value is `false`."),
  });
}