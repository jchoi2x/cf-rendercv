import { z } from "@hono/zod-openapi";
import { getLocaleSchema } from "./themes/lib/locale";

export const localeSchema = z.lazy(() =>
  z.union([
    getLocaleSchema('english'),
    getLocaleSchema('arabic'),
    getLocaleSchema('danish'),
    getLocaleSchema('dutch'),
    getLocaleSchema('french'),
    getLocaleSchema('german'),
    getLocaleSchema('hebrew'),
    getLocaleSchema('hindi'),
    getLocaleSchema('indonesian'),
    getLocaleSchema('italian'),
    getLocaleSchema('japanese'),
    getLocaleSchema('korean'),
    getLocaleSchema('mandarin_chinese'),
    getLocaleSchema('norwegian_bokmål'),
    getLocaleSchema('norwegian_nynorsk'),
    getLocaleSchema('persian'),
    getLocaleSchema('portuguese'),
    getLocaleSchema('russian'),
    getLocaleSchema('spanish'),
    getLocaleSchema('turkish'),
    getLocaleSchema('vietnamese'),
  ]),
);

export const Locale = localeSchema;

export type LocaleSchemaType = z.infer<typeof localeSchema>;
