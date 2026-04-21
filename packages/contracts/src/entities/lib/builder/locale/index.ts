import { z } from "@hono/zod-openapi";

import { LOCALE_DEFAULTS, type TLocaleName } from "./defaults";

export const getLocaleSchema = (language: TLocaleName) => {
  const defaults = LOCALE_DEFAULTS[language];
  return z.object({
    language: z
      .literal(language)
      .describe("The language for your CV.")
      .default(language),
    last_updated: z.string().default(defaults.last_updated),
    month: z.string().default(defaults.month),
    months: z.string().default(defaults.months),
    year: z.string().default(defaults.year),
    years: z.string().default(defaults.years),
    present: z.string().default(defaults.present),
    month_abbreviations: z
      .array(z.string())
      .default(defaults.month_abbreviations),
    month_names: z.array(z.string()).default(defaults.month_names),
  });
};

// export type TLocale = z.infer<ReturnType<typeof getLocaleSchema>>;
export type TLocaleSchema = ReturnType<typeof getLocaleSchema>;
