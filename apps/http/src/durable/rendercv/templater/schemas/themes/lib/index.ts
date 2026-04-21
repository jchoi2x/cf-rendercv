import { z } from "@hono/zod-openapi";

import { Cv, type CvSchemaType } from "./cv";
import { getDesignSchema } from "./design";
import type { TThemeName } from "./design/defaults";
import { getLocaleSchema } from "./locale";
import type { TLocaleName } from "./locale/defaults";
import { getSettingsSchema } from "./settings";

export const getSchema = (themeName: TThemeName, localeName: TLocaleName) => {
  return z.object({
    cv: Cv,
    design: getDesignSchema(themeName),
    locale: getLocaleSchema(localeName),
    settings: getSettingsSchema(),
  });
};
export type TRootSchema = z.infer<ReturnType<typeof getSchema>>;
export type TThemeSchema = z.infer<ReturnType<typeof getDesignSchema>>;
export type TLocaleSchema = z.infer<ReturnType<typeof getLocaleSchema>>;
export type TSettingsSchema = z.infer<ReturnType<typeof getSettingsSchema>>;
export type TCvSchema = CvSchemaType;
