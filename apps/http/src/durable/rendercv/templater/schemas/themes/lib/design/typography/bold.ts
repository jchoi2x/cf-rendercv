import { z } from "@hono/zod-openapi";


export interface Bold {
  name?: boolean;
  headline?: boolean;
  connections?: boolean;
  section_titles?: boolean;
}

export const getBold = (defaults: Bold) => {
  return z.object({
    name: z.boolean()
      .default(defaults.name ?? false)
      .describe("Use small caps for the name. The default value is `false`."),
    headline: z.boolean()
      .default(defaults.headline ?? false)
      .describe("Use small caps for the headline. The default value is `false`."),
    connections: z.boolean()
      .default(defaults.connections ?? false)
      .describe("Use small caps for connections. The default value is `false`."),
    section_titles: z.boolean()
      .default(defaults.section_titles ?? false)
      .describe("Use small caps for section titles. The default value is `false`."),
  });
}

export type TBold = z.infer<ReturnType<typeof getBold>>;