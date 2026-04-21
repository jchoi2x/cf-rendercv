import { getSchema } from "./schemas/themes/lib";
import type { TLocaleName } from "./schemas/themes/lib/locale/defaults";
import type { TThemeName } from "./schemas/themes/lib/design/defaults";
import { getPreambleContextForTheme } from "./defaults/theme-defaults";
import type { RenderCvDocumentPayload } from "./types";

/** Preserve CV field order from the input object (Python `Cv.capture_input_order`). */
export function captureCvKeyOrder(cv: unknown): string[] {
  if (!cv || typeof cv !== "object" || Array.isArray(cv)) return [];
  return Object.keys(cv as Record<string, unknown>).filter(
    (k) => (cv as Record<string, unknown>)[k] != null,
  );
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

/**
 * Deep-merge plain objects. Arrays and scalars from `override` replace `base`.
 * Used to layer user input on theme defaults before Zod validation (Pydantic-style).
 */
function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const ov = override[key];
    if (ov === undefined) continue;
    const bv = base[key];
    if (isPlainObject(bv) && isPlainObject(ov)) {
      out[key] = deepMerge(bv, ov);
    } else {
      out[key] = ov;
    }
  }
  return out;
}

/**
 * Merge theme/locale defaults into the document, then validate with the root Zod schema.
 * Replaces `safeParse` + raw fallback so the processed model always reflects defaults.
 */
export function mergeAndParseRenderCvPayload(
  payload: RenderCvDocumentPayload,
  themeName: TThemeName,
  localeName: TLocaleName,
): RenderCvDocumentPayload {
  const preamble = getPreambleContextForTheme(themeName, localeName);
  const pCv = (preamble.cv ?? {}) as Record<string, unknown>;
  const pDesign = (preamble.design ?? {}) as Record<string, unknown>;
  const pLocale = (preamble.locale ?? {}) as Record<string, unknown>;
  const pSettings = (preamble.settings ?? {}) as Record<string, unknown>;
  const uCv = (payload.cv ?? {}) as Record<string, unknown>;
  const uDesign = (payload.design ?? {}) as Record<string, unknown>;
  const uLocale = (payload.locale ?? {}) as Record<string, unknown>;
  const uSettings = (payload.settings ?? {}) as Record<string, unknown>;

  const mergedDesign = deepMerge(pDesign, uDesign);
  const pEntries = (pDesign.entries ?? {}) as Record<string, unknown>;
  const uEntries = (uDesign.entries ?? {}) as Record<string, unknown>;
  if (Object.keys(pEntries).length || Object.keys(uEntries).length) {
    mergedDesign.entries = deepMerge(pEntries, uEntries);
  }

  const merged: Record<string, unknown> = {
    cv: deepMerge(pCv, uCv),
    design: mergedDesign,
    locale: deepMerge(pLocale, uLocale),
    settings: deepMerge(pSettings, uSettings),
  };

  return getSchema(themeName, localeName).parse(merged) as RenderCvDocumentPayload;
}
