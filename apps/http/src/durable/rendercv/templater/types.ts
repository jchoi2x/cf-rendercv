import type { TCvSchema, TRootSchema } from "./schemas/themes/lib";

export const ThemeNames: string[] = [
  "classic",
  "engineeringclassic",
  "ember",
  "engineeringresumes",
  "moderncv",
  "harvard",
  "ink",
  "opal",
  "sb2nov",
] as const;

export interface RenderSection {
  title: string;
  snake_case_title: string;
  entry_type: string;
  entries: unknown[];
}

/** Normalized CV entry fields used by forked `.j2.typ` templates (`*_lines`, etc.). */
export interface NormalizedEntry {
  date?: string;
  location?: string;
  main_column?: string;
  main_column_lines?: string[];
  date_and_location_column?: string;
  date_and_location_column_lines?: string[];
  degree_column?: string;
  bullet?: string;
  number?: string;
  reversed_number?: string;
  position?: string;
  company?: string;
  institution?: string;
  name?: string;
  title?: string;
  text?: string;
  summary?: string;
  degree?: string;
  area?: string;
  highlights?: string;
  rank?: string;
  publication?: string;
  publication_type?: string;
  publication_title?: string;
  publication_authors?: string;
  publication_date?: string;
  publication_url?: string;
  publication_pdf_url?: string;
  [key: string]: unknown;
}

/**
 * Top-level Jinja context for preamble/header — mirrors Python
 * `render_single_template(..., cv=, design=, locale=, settings=)`.
 */
export type RenderCvJinjaRootContext = {
  cv: TCvSchema;
  design: { theme?: string } | Record<string, unknown>;
  locale: Record<string, unknown>;
  settings: Record<string, unknown>;
};

export interface CreateTemplateModelResult {
  data: RenderCvJinjaRootContext;
  sections: RenderSection[];
}

/**
 * Validated top-level document after `mergeAndParseRenderCvPayload` / `getSchema(theme, locale).parse`:
 * theme defaults are deep-merged with user input, then Zod applies `Cv` transforms (website pick, `_key_order`).
 * Run `processModel` to produce the template root context (`cv`, `design`, `locale`, `settings`).
 */
export type RenderCvDocumentPayload = Required<TRootSchema>;
