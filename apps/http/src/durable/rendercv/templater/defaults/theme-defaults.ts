import type { RenderCvJinjaRootContext } from "../types";
import {
  BUILT_IN_THEME_OVERRIDES,
  type TThemeName,
} from "../schemas/themes/lib/design/defaults";
import { LOCALE_DEFAULTS, type TLocaleName } from "../schemas/themes/lib/locale/defaults";


const FALLBACK_THEME: TThemeName = "classic";

function isThemeName(value: unknown): value is TThemeName {
  return typeof value === "string" && value in BUILT_IN_THEME_OVERRIDES;
}

export function getPreambleContextForTheme(
  theme: TThemeName | string | undefined,
  locale: TLocaleName | string | undefined,
): Partial<RenderCvJinjaRootContext> {
  const normalizedTheme = isThemeName(theme) ? theme : FALLBACK_THEME;
  const designDefaults = BUILT_IN_THEME_OVERRIDES[normalizedTheme];

  return {
    design: structuredClone(designDefaults),
    locale: structuredClone(LOCALE_DEFAULTS[locale as TLocaleName]),
    settings: {
      current_date: "today",
      render_command: {},
      bold_keywords: [],
      pdf_title: "NAME - CV",
    },
  };
}
