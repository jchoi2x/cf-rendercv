import initMiniJinja, {
  create_env,
  type JsExposedEnv,
} from "@jchoi2x/minijinja";
import wasm from "@jchoi2x/minijinja/minijinja_bg.wasm";
import type { z } from "zod";

import type { RenderCvDocument } from "@cf-rendercv/contracts";

import { ENTRY_TEMPLATE_MAP, TEMPLATE_SOURCES } from "./template-sources";

type RenderSection = {
  title: string;
  snake_case_title: string;
  entry_type: string;
  entries: unknown[];
};

type Entry = {
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
};

/**
 * Builds Typst source from bundled `.j2.typ` (MiniJinja) templates and a RenderCV-shaped payload.
 */
export class Templater {
  private templateEnvPromise: Promise<JsExposedEnv> | null = null;

  private async getTemplateEnv(): Promise<JsExposedEnv> {
    if (!this.templateEnvPromise) {
      this.templateEnvPromise = (async () => {
        await initMiniJinja(wasm);
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
      return `(${Number(color[0])}, ${Number(color[1])}, ${Number(color[2])})`;
    }
    if (typeof color === "string") {
      const hex = color.trim();
      const match = /^#?([0-9a-f]{6})$/i.exec(hex);
      if (match) {
        const raw = match[1];
        const r = Number.parseInt(raw.slice(0, 2), 16);
        const g = Number.parseInt(raw.slice(2, 4), 16);
        const b = Number.parseInt(raw.slice(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    return "rgb(0, 0, 0)";
  }

  private toPlainName(name: string): string {
    return name.replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
  }

  private createTemplateModel(
    payload: z.infer<typeof RenderCvDocument>,
  ): Record<string, any> {
    const now = new Date();
    const cv = payload.cv ?? {};
    const design = payload.design ?? {};
    const locale = payload.locale ?? {};
    const settings = payload.settings ?? {};
    const localeRecord = locale as Record<string, unknown>;
    const settingsRecord = settings as Record<string, unknown>;
    const typographyFontFamily =
      typeof design.typography?.font_family === "object" &&
      design.typography?.font_family !== null
        ? (design.typography.font_family as Record<string, unknown>)
        : {};
    const resolvedCurrentDate =
      typeof settingsRecord._resolved_current_date === "object" &&
      settingsRecord._resolved_current_date !== null
        ? (settingsRecord._resolved_current_date as Record<string, unknown>)
        : undefined;
    const cvName = cv.name ?? "John Doe";
    const resolvedYear =
      (resolvedCurrentDate?.year as number | undefined) ?? now.getUTCFullYear();
    const resolvedMonth =
      (resolvedCurrentDate?.month as number | undefined) ??
      now.getUTCMonth() + 1;
    const _resolvedDay =
      (resolvedCurrentDate?.day as number | undefined) ?? now.getUTCDate();
    const monthAbbreviations = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthLabel =
      monthAbbreviations[Math.min(Math.max(resolvedMonth, 1), 12) - 1] ?? "Jan";
    const colors = design.colors ?? {};

    const model = {
      cv: {
        ...cv,
        _plain_name: cv._plain_name ?? this.toPlainName(cvName),
        _footer:
          cv._footer ??
          `context { [#emph[${cvName} -- #str(here().page())\\/#str(counter(page).final().first())]] }`,
        _top_note:
          cv._top_note ??
          `#emph[Last updated in ${monthLabel} ${resolvedYear}]`,
        _connections: cv._connections ?? [],
      },
      design: {
        page: {
          size: design.page?.size ?? "us-letter",
          top_margin: design.page?.top_margin ?? "0.7in",
          bottom_margin: design.page?.bottom_margin ?? "0.7in",
          left_margin: design.page?.left_margin ?? "0.7in",
          right_margin: design.page?.right_margin ?? "0.7in",
          show_footer: design.page?.show_footer ?? true,
          show_top_note: design.page?.show_top_note ?? true,
        },
        colors: {
          body: colors.body ?? "#000000",
          name: colors.name ?? "#004f90",
          headline: colors.headline ?? "#004f90",
          connections: colors.connections ?? "#004f90",
          section_titles: colors.section_titles ?? "#004f90",
          links: colors.links ?? "#004f90",
          footer: colors.footer ?? "#808080",
          top_note: colors.top_note ?? "#808080",
        },
        typography: {
          line_spacing: design.typography?.line_spacing ?? "0.6em",
          alignment: design.typography?.alignment ?? "justified",
          date_and_location_column_alignment:
            design.typography?.date_and_location_column_alignment ?? "right",
          font_family: {
            body: typographyFontFamily.body ?? "Fontin",
            name: typographyFontFamily.name ?? "Fontin",
            headline: typographyFontFamily.headline ?? "Fontin",
            connections: typographyFontFamily.connections ?? "Fontin",
            section_titles: typographyFontFamily.section_titles ?? "Fontin",
          },
          font_size: {
            body: design.typography?.font_size?.body ?? "10pt",
            name: design.typography?.font_size?.name ?? "25pt",
            headline: design.typography?.font_size?.headline ?? "10pt",
            connections: design.typography?.font_size?.connections ?? "10pt",
            section_titles:
              design.typography?.font_size?.section_titles ?? "1.4em",
          },
          small_caps: {
            name: design.typography?.small_caps?.name ?? false,
            headline: design.typography?.small_caps?.headline ?? false,
            connections: design.typography?.small_caps?.connections ?? false,
            section_titles:
              design.typography?.small_caps?.section_titles ?? false,
          },
          bold: {
            name: design.typography?.bold?.name ?? false,
            headline: design.typography?.bold?.headline ?? false,
            connections: design.typography?.bold?.connections ?? false,
            section_titles: design.typography?.bold?.section_titles ?? false,
          },
        },
        links: {
          underline: design.links?.underline ?? true,
          show_external_link_icon:
            design.links?.show_external_link_icon ?? false,
        },
        header: {
          alignment: design.header?.alignment ?? "left",
          photo_width: design.header?.photo_width ?? "4.15cm",
          space_below_name: design.header?.space_below_name ?? "0.7cm",
          space_below_headline: design.header?.space_below_headline ?? "0.7cm",
          space_below_connections:
            design.header?.space_below_connections ?? "0.7cm",
          photo_space_left: design.header?.photo_space_left ?? "0cm",
          photo_space_right: design.header?.photo_space_right ?? "0.6cm",
          photo_position: design.header?.photo_position ?? "right",
          connections: {
            hyperlink: design.header?.connections?.hyperlink ?? true,
            show_icons: design.header?.connections?.show_icons ?? true,
            display_urls_instead_of_usernames:
              design.header?.connections?.display_urls_instead_of_usernames ??
              false,
            separator: design.header?.connections?.separator ?? "",
            space_between_connections:
              design.header?.connections?.space_between_connections ?? "0.5cm",
          },
        },
        section_titles: {
          type: design.section_titles?.type ?? "moderncv",
          line_thickness: design.section_titles?.line_thickness ?? "0.15cm",
          space_above: design.section_titles?.space_above ?? "0.55cm",
          space_below: design.section_titles?.space_below ?? "0.3cm",
        },
        sections: {
          allow_page_break: design.sections?.allow_page_break ?? true,
          space_between_text_based_entries:
            design.sections?.space_between_text_based_entries ?? "0.3em",
          space_between_regular_entries:
            design.sections?.space_between_regular_entries ?? "1.2em",
        },
        entries: {
          date_and_location_width:
            design.entries?.date_and_location_width ?? "3cm",
          side_space: design.entries?.side_space ?? "0.2cm",
          space_between_columns:
            design.entries?.space_between_columns ?? "0.8cm",
          allow_page_break: design.entries?.allow_page_break ?? false,
          short_second_row: design.entries?.short_second_row ?? false,
          degree_width: design.entries?.degree_width ?? "2.5cm",
          summary: {
            space_left: design.entries?.summary?.space_left ?? "0cm",
            space_above: design.entries?.summary?.space_above ?? "0.1cm",
          },
          highlights: {
            bullet: design.entries?.highlights?.bullet ?? "●",
            nested_bullet:
              design.entries?.highlights?.nested_bullet ?? "\u25e6",
            space_left: design.entries?.highlights?.space_left ?? "1cm",
            space_above: design.entries?.highlights?.space_above ?? "0.1cm",
            space_between_items:
              design.entries?.highlights?.space_between_items ?? "0.1cm",
            space_between_bullet_and_text:
              design.entries?.highlights?.space_between_bullet_and_text ??
              "0.6cm",
          },
        },
        templates: {
          education_entry: {
            degree_column:
              design.templates?.education_entry?.degree_column ??
              (design.theme === "sb2nov" ? false : true),
          },
        },
      },
      locale: {
        language_iso_639_1:
          (localeRecord.language_iso_639_1 as string | undefined) ?? "en",
        is_rtl: (localeRecord.is_rtl as boolean | undefined) ?? false,
      },
      settings: {
        pdf_title: settings.pdf_title ?? `${cvName} CV`,
        _resolved_current_date: {
          year:
            (resolvedCurrentDate?.year as number | undefined) ??
            now.getUTCFullYear(),
          month:
            (resolvedCurrentDate?.month as number | undefined) ??
            now.getUTCMonth() + 1,
          day:
            (resolvedCurrentDate?.day as number | undefined) ??
            now.getUTCDate(),
        },
      },
    };

    return model;
  }

  private toEmph(value: string): string {
    return value ? `#emph[${value}]` : "";
  }

  private toStrong(value: string): string {
    return value ? `#strong[${value}]` : "";
  }

  private normalizeEntry(entry: unknown, theme?: string): unknown {
    if (typeof entry === "string") {
      return entry;
    }

    const raw = (entry ?? {}) as Entry;
    const date = String(raw.date ?? "").trim() || "";
    const location = String(raw.location ?? "").trim() || "";
    const dateAndLocation =
      theme === "sb2nov"
        ? [location, date]
            .filter(Boolean)
            .map((part) => this.toEmph(part))
            .join("\n")
        : [date, location].filter(Boolean).join(" | ");
    const isEducation = Boolean(raw.institution || raw.degree || raw.area);
    const degree = String(raw.degree ?? "").trim();
    const area = String(raw.area ?? "").trim();
    const sb2novEducationMain = [
      this.toStrong(String(raw.institution ?? "").trim()),
      [degree, degree && area ? "in" : "", area]
        .filter(Boolean)
        .map((part) => this.toEmph(part))
        .join(" "),
    ]
      .filter(Boolean)
      .join("\n");
    const mainColumn = [
      raw.position ??
        raw.company ??
        raw.institution ??
        raw.name ??
        raw.title ??
        "",
      raw.company ?? "",
    ]
      .map((v: unknown) => String(v).trim())
      .filter(Boolean)
      .join("\n");
    return {
      ...raw,
      main_column: String(
        raw.main_column ??
          (theme === "sb2nov" && isEducation
            ? sb2novEducationMain
            : mainColumn),
      ),
      main_column_lines: String(
        raw.main_column ??
          (theme === "sb2nov" && isEducation
            ? sb2novEducationMain
            : mainColumn),
      ).split("\n"),
      date_and_location_column: String(
        raw.date_and_location_column ?? dateAndLocation,
      ),
      date_and_location_column_lines: String(
        raw.date_and_location_column ?? dateAndLocation,
      ).split("\n"),
      degree_column: String(
        raw.degree_column ??
          (theme === "sb2nov" && isEducation
            ? ""
            : [raw.degree, raw.area].filter(Boolean).join(" ")),
      ),
      bullet: String(raw.bullet ?? raw.text ?? raw.summary ?? ""),
      number: String(raw.number ?? raw.rank ?? ""),
      reversed_number: String(raw.reversed_number ?? raw.rank ?? ""),
    };
  }

  private inferEntryType(entries: unknown[]): string {
    const first = entries[0];
    if (typeof first === "string") {
      return "TextEntry";
    }
    const obj = (first ?? {}) as Record<string, unknown>;
    if ("institution" in obj || "degree" in obj) {
      return "EducationEntry";
    }
    if ("position" in obj || "company" in obj) {
      return "ExperienceEntry";
    }
    return "NormalEntry";
  }

  private buildSections(payload: Record<string, any>): RenderSection[] {
    const cv = payload.cv ?? {};
    const theme =
      typeof payload.design?.theme === "string"
        ? payload.design.theme
        : undefined;
    if (Array.isArray(cv.rendercv_sections)) {
      return cv.rendercv_sections.map((section: any) => ({
        title: String(section.title ?? ""),
        snake_case_title: String(section.snake_case_title ?? "")
          .trim()
          .replace(/\s+/g, "_")
          .toLowerCase(),
        entry_type: String(section.entry_type ?? "NormalEntry"),
        entries: Array.isArray(section.entries)
          ? section.entries.map((entry: unknown) =>
              this.normalizeEntry(entry, theme),
            )
          : [],
      }));
    }

    const sections: RenderSection[] = [];
    const sectionMap = cv.sections ?? {};
    for (const [title, values] of Object.entries(sectionMap)) {
      const rawEntries = Array.isArray(values) ? values : [values];
      const entryType = this.inferEntryType(rawEntries);
      sections.push({
        title,
        snake_case_title: title.trim().replace(/\s+/g, "_").toLowerCase(),
        entry_type: entryType,
        entries: rawEntries.map((entry) => this.normalizeEntry(entry, theme)),
      });
    }
    return sections;
  }

  private async renderTemplate(
    templateName: keyof typeof TEMPLATE_SOURCES,
    context: Record<string, unknown>,
  ): Promise<string> {
    const env = await this.getTemplateEnv();
    env.add_filter("as_rgb", (value: unknown) => {
      return this.toRgbTuple(value);
    });

    const template = env.render(templateName, context).trimEnd();
    return template;
  }

  async buildTypstSource(payload: unknown): Promise<string> {
    const safePayload =
      payload && typeof payload === "object"
        ? (payload as Record<string, any>)
        : {};
    const templateModel = this.createTemplateModel(safePayload);
    const sections = this.buildSections(safePayload);
    const preamble = await this.renderTemplate("preamble", templateModel);
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
      const entriesCode = (
        await Promise.all(
          section.entries.map((entry) =>
            this.renderTemplate(entryTemplate, { ...templateModel, entry }),
          ),
        )
      ).join("\n\n");
      code += `\n${sectionBeginning}\n${entriesCode}\n${sectionEnding}`;
    }
    return code;
  }
}
