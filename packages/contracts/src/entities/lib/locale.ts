import { z } from "@hono/zod-openapi";
import _ from "lodash";

import type { TLocaleSchema } from "./builder/locale";
import { getLocaleSchema } from "./builder/locale";
import { languages } from "./builder/locale/defaults";

const localeSchemas: Record<string, TLocaleSchema> = languages.reduce(
  (acc, language) => {
    const languageName = _.upperFirst(_.camelCase(language));
    return {
      ...acc,
      [`${languageName}Locale`]: getLocaleSchema(language),
    };
  },
  {},
);

export const Locale = z.union(Object.values(localeSchemas));
export type TLocale = z.infer<typeof Locale>;
