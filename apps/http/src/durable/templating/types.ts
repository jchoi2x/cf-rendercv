import type { z } from "zod";

import type { RenderCvDocument } from "@cf-rendercv/contracts";

/** Keys registered in MiniJinja for Typst Jinja templates. */
export type JinjaTemplateKey =
  | "preamble"
  | "header"
  | "sectionBegin"
  | "sectionEnd"
  | "bulletEntry"
  | "educationEntry"
  | "experienceEntry"
  | "normalEntry"
  | "numberedEntry"
  | "oneLineEntry"
  | "publicationEntry"
  | "reversedNumberedEntry"
  | "textEntry";

/** Maps RenderCV section `entry_type` string to internal template key. */
export type EntryTemplateMap = Record<string, JinjaTemplateKey>;

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
  cv: Record<string, unknown>;
  design: { theme?: string } | Record<string, unknown>;
  locale: Record<string, unknown>;
  settings: Record<string, unknown>;
};

/**
 * Section templates receive the root context plus kwargs matching Python
 * `section_title`, `snake_case_section_title`, `entry_type`.
 */
export type SectionJinjaContext = RenderCvJinjaRootContext & {
  section_title: string;
  snake_case_section_title: string;
  entry_type: string;
};

export interface CreateTemplateModelResult {
  data: RenderCvJinjaRootContext;
  sections: RenderSection[];
}

export interface CompileRenderCvTypstSourceResult {
  preamble: string;
  header: string;
  sectionTemplates: string[];
  model: RenderCvJinjaRootContext;
  sections: RenderSection[];
  code: string;
}

export type RenderCvDocumentPayload = Required<
  z.infer<typeof RenderCvDocument>
>;
