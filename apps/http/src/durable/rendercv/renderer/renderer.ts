import init, { create_env, type JsExposedEnv } from "@jchoi2x/minijinja";
import wasm from "@jchoi2x/minijinja/minijinja_bg.wasm";

import { createTemplateModel } from "../templater/create-template-model";
import {
  applyStringProcessors,
  escapeNonUrlForwardSlashes,
  makeKeywordsBold,
  markdownToTypst,
} from "../templater/model-processor-helpers";
import BULLET_ENTRY_TEMPLATE from "./templates/typst/entries/BulletEntry.j2.typ";
import EDUCATION_ENTRY_TEMPLATE from "./templates/typst/entries/EducationEntry.j2.typ";
import EXPERIENCE_ENTRY_TEMPLATE from "./templates/typst/entries/ExperienceEntry.j2.typ";
import NORMAL_ENTRY_TEMPLATE from "./templates/typst/entries/NormalEntry.j2.typ";
import NUMBERED_ENTRY_TEMPLATE from "./templates/typst/entries/NumberedEntry.j2.typ";
import ONE_LINE_ENTRY_TEMPLATE from "./templates/typst/entries/OneLineEntry.j2.typ";
import PUBLICATION_ENTRY_TEMPLATE from "./templates/typst/entries/PublicationEntry.j2.typ";
import REVERSED_NUMBERED_ENTRY_TEMPLATE from "./templates/typst/entries/ReversedNumberedEntry.j2.typ";
import TEXT_ENTRY_TEMPLATE from "./templates/typst/entries/TextEntry.j2.typ";
import HEADER_TEMPLATE from "./templates/typst/Header.j2.typ";
import PREAMBLE_TEMPLATE from "./templates/typst/Preamble.j2.typ";
import SECTION_BEGIN_TEMPLATE from "./templates/typst/SectionBeginning.j2.typ";
import SECTION_END_TEMPLATE from "./templates/typst/SectionEnding.j2.typ";
import type { TLocaleName } from "../templater/schemas/themes/lib/locale/defaults";
import type { RenderCvDocumentPayload } from "../templater/types";

/**
 * MiniJinja emits extra blank lines vs upstream Jinja2. Normalize runs of newlines so
 * Typst output matches canonical RenderCV spacing (at most two consecutive blank lines,
 * with only two places that use a three-newline run).
 */
function normalizeTypstWhitespace(
  source: string,
  headerPlainName: string,
): string {
  let s = source.replace(/\n{4,}/g, "\n\n\n");
  s = s.replace(
    / {2}\),\n\)\n\n\n= [^\n]+\n\n\n(?=#connections\()/,
    "<<<PREAMBLE>>>",
  );
  s = s.replace(/\]\],\n\)\n\n\n== Welcome to RenderCV/, "<<<CONN>>>");
  let prev = "";
  while (s !== prev) {
    prev = s;
    s = s.replace(/\n\n\n/g, "\n\n");
  }
  s = s.replace(
    /<<<PREAMBLE>>>/,
    () => `  ),\n)\n\n\n= ${headerPlainName}\n\n`,
  );
  s = s.replace(/<<<CONN>>>/, () => "]],\n)\n\n\n== Welcome to RenderCV");
  s = s.replace(/#connections\(\n\n/g, "#connections(\n");
  s = s.replace(/\],\n\n {2}\[/g, "],\n  [");
  s = s.replace(/\]\],\n\n\)/g, "]],\n)");
  prev = "";
  while (s !== prev) {
    prev = s;
    s = s.replace(/ {2}\[\n\n( {4})/g, "  [\n$1");
  }
  s = s.replace(/ {2}\],\n\n {2}degree-column/g, "  ],\n  degree-column");
  s = s.replace(/ {2}\],\n\n\)/g, "  ],\n)");
  s = s.replace(/\n(\+[^\n]+)\n\n( {2}\],\n\)\n)$/, "\n$1\n$2");
  return s;
}

export const TEMPLATE_SOURCES = {
  preamble: PREAMBLE_TEMPLATE,
  header: HEADER_TEMPLATE,
  sectionBegin: SECTION_BEGIN_TEMPLATE,
  sectionEnd: SECTION_END_TEMPLATE,
  bulletEntry: BULLET_ENTRY_TEMPLATE,
  educationEntry: EDUCATION_ENTRY_TEMPLATE,
  experienceEntry: EXPERIENCE_ENTRY_TEMPLATE,
  normalEntry: NORMAL_ENTRY_TEMPLATE,
  numberedEntry: NUMBERED_ENTRY_TEMPLATE,
  oneLineEntry: ONE_LINE_ENTRY_TEMPLATE,
  publicationEntry: PUBLICATION_ENTRY_TEMPLATE,
  reversedNumberedEntry: REVERSED_NUMBERED_ENTRY_TEMPLATE,
  textEntry: TEXT_ENTRY_TEMPLATE,
} as const;

const ENTRY_TEMPLATE_MAP: Record<string, keyof typeof TEMPLATE_SOURCES> = {
  BulletEntry: "bulletEntry",
  EducationEntry: "educationEntry",
  ExperienceEntry: "experienceEntry",
  NormalEntry: "normalEntry",
  NumberedEntry: "numberedEntry",
  OneLineEntry: "oneLineEntry",
  PublicationEntry: "publicationEntry",
  ReversedNumberedEntry: "reversedNumberedEntry",
  TextEntry: "textEntry",
};

/**
 * Builds Typst source from bundled `.j2.typ` (MiniJinja) templates and a RenderCV-shaped payload.
 */
export class Renderer {
  private templateEnvPromise: Promise<JsExposedEnv> | null = null;

  private async getTemplateEnv(): Promise<JsExposedEnv> {
    if (!this.templateEnvPromise) {
      this.templateEnvPromise = (async () => {
        const isWorkerd =
          typeof (globalThis as unknown as { WebSocketPair?: unknown })
            .WebSocketPair === "function";

        // The node bundle auto-initializes its embedded WASM at import time.
        // The workerd/web bundles require explicit initialization.
        if (isWorkerd) {
          await init(wasm);
        }

        // Node (`package.json` "node" export): WASM is loaded inside the package at import time.
        // Do not `import "*.wasm"` here — Vitest/Node ESM cannot load `.wasm` as a module.
        const preparedTemplates: Record<string, string> = {};
        for (const [name, source] of Object.entries(TEMPLATE_SOURCES)) {
          preparedTemplates[name] = source.replaceAll(
            ".splitlines()",
            '.split("\\n")',
          );
        }
        return create_env(preparedTemplates);
      })();
    }
    return this.templateEnvPromise;
  }

  private toRgbTuple(color: unknown): string {
    if (Array.isArray(color) && color.length === 3) {
      return `rgb(${Number(color[0])}, ${Number(color[1])}, ${Number(color[2])})`;
    }
    if (typeof color === "string") {
      const s = color.trim();
      const rgbFn = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(s);
      if (rgbFn) {
        return `rgb(${Number(rgbFn[1])}, ${Number(rgbFn[2])}, ${Number(rgbFn[3])})`;
      }
      const match = /^#?([0-9a-f]{6})$/i.exec(s);
      if (match) {
        const raw = match[1];
        if (!raw) {
          return "rgb(0, 0, 0)";
        }
        const r = Number.parseInt(raw.slice(0, 2), 16);
        const g = Number.parseInt(raw.slice(2, 4), 16);
        const b = Number.parseInt(raw.slice(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    return "rgb(0, 0, 0)";
  }

  /**
   * Preamble template expects `settings._resolved_current_date.{year,month,day}`;
   * `processModel` stores an ISO date string for the rest of the pipeline.
   */
  private localeNameToIso6391(name: unknown): string {
    const map: Record<TLocaleName, string> = {
      arabic: "ar",
      danish: "da",
      dutch: "nl",
      english: "en",
      french: "fr",
      german: "de",
      hebrew: "he",
      hindi: "hi",
      hungarian: "hu",
      indonesian: "id",
      italian: "it",
      japanese: "ja",
      korean: "ko",
      mandarin_chinese: "zh",
      norwegian_bokmål: "nb",
      norwegian_nynorsk: "nn",
      persian: "fa",
      portuguese: "pt",
      russian: "ru",
      spanish: "es",
      turkish: "tr",
      vietnamese: "vi",
    };
    return typeof name === "string" && name in map
      ? map[name as TLocaleName]
      : "en";
  }

  private localeNameIsRtl(name: unknown): boolean {
    return name === "arabic" || name === "hebrew" || name === "persian";
  }

  private typstResolvedCurrentDate(settings: Record<string, unknown>): {
    year: number;
    month: number;
    day: number;
  } {
    const v = settings._resolved_current_date;
    if (
      v &&
      typeof v === "object" &&
      typeof (v as { year?: unknown }).year === "number" &&
      typeof (v as { month?: unknown }).month === "number" &&
      typeof (v as { day?: unknown }).day === "number"
    ) {
      return v as { year: number; month: number; day: number };
    }
    if (typeof v === "string") {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
      if (m) {
        return {
          year: Number(m[1]),
          month: Number(m[2]),
          day: Number(m[3]),
        };
      }
    }
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }

  private async renderTemplate(
    templateName: keyof typeof TEMPLATE_SOURCES,
    context: Record<string, unknown>,
  ): Promise<string> {
    const env = await this.getTemplateEnv();
    env.add_filter("as_rgb", (value: unknown) => {
      return this.toRgbTuple(value);
    });

    return env.render(templateName, context);
  }

  async buildTypstSource(payload: RenderCvDocumentPayload): Promise<string> {
    const { data: templateModel, sections } = createTemplateModel(payload);

    const settings = templateModel.settings;
    const locale = templateModel.locale;
    const preamble = await this.renderTemplate("preamble", {
      ...templateModel,
      locale: {
        ...locale,
        language_iso_639_1: this.localeNameToIso6391(locale.language),
        is_rtl: this.localeNameIsRtl(locale.language),
      },
      settings: {
        ...settings,
        _resolved_current_date: this.typstResolvedCurrentDate(settings),
      },
    });
    const header = await this.renderTemplate("header", templateModel);

    let code = `${preamble}\n\n${header}\n`;
    for (const section of sections) {
      const sectionBeginning = await this.renderTemplate("sectionBegin", {
        ...templateModel,
        section_title: section.title,
        snake_case_section_title: section.snake_case_title,
        entry_type: section.entry_type,
      });
      const sectionEnding = await this.renderTemplate("sectionEnd", {
        ...templateModel,
        entry_type: section.entry_type,
      });
      const entryTemplate =
        ENTRY_TEMPLATE_MAP[section.entry_type] ?? "normalEntry";
      const boldKeywords = (
        (templateModel.settings.bold_keywords as string[] | undefined) ?? []
      ).filter((k): k is string => typeof k === "string");
      const textEntryProcessors = [
        (v: string) => makeKeywordsBold(v, boldKeywords),
        markdownToTypst,
        escapeNonUrlForwardSlashes,
      ];
      const entriesCode = (
        await Promise.all(
          section.entries.map((entry: unknown) => {
            const entryForTemplate =
              entryTemplate === "textEntry" && typeof entry === "string"
                ? applyStringProcessors(entry, textEntryProcessors)
                : entry;
            return this.renderTemplate(entryTemplate, {
              ...templateModel,
              entry: entryForTemplate,
            });
          }),
        )
      ).join("\n\n");
      code += `\n${sectionBeginning}\n${entriesCode}\n${sectionEnding}`;
    }
    const headerPlainName =
      typeof templateModel.cv._plain_name === "string"
        ? templateModel.cv._plain_name
        : typeof templateModel.cv.name === "string"
          ? templateModel.cv.name
          : "";
    return normalizeTypstWhitespace(code, headerPlainName);
  }
}
