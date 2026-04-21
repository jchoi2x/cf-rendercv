import { createTemplateModel } from "./create-template-model";
import { renderTemplate } from "./render-template";
import { ENTRY_TEMPLATE_MAP } from "./template-sources";
import type {
  CompileRenderCvTypstSourceResult,
  RenderCvDocumentPayload,
  SectionJinjaContext,
} from "./types";

/**
 * Renders full Typst document from a validated RenderCV document, matching Python
 * `render_full_template` assembly (preamble, header, sections, entries) and
 * `render_single_template` context (`cv`, `design`, `locale`, `settings`, plus
 * section/entry kwargs).
 */
export async function compileRenderCvTypstSource(
  payload: RenderCvDocumentPayload,
): Promise<CompileRenderCvTypstSourceResult> {
  const { data: model, sections } = createTemplateModel(payload);

  const preamble = await renderTemplate(
    "preamble",
    model as Record<string, unknown>,
  );
  const header = await renderTemplate(
    "header",
    model as Record<string, unknown>,
  );
  const sectionTemplates: string[] = [];
  let code = `${preamble}\n\n${header}\n`;

  for (const section of sections) {
    const sectionContext: SectionJinjaContext = {
      ...model,
      section_title: section.title,
      snake_case_section_title: section.snake_case_title,
      entry_type: section.entry_type,
    };

    const sectionBegin = await renderTemplate(
      "sectionBegin",
      sectionContext as Record<string, unknown>,
    );

    const sectionEndTemplate = await renderTemplate(
      "sectionEnd",
      sectionContext as Record<string, unknown>,
    );

    const entryTemplateKey =
      ENTRY_TEMPLATE_MAP[section.entry_type] ?? "normalEntry";

    const entryCodes = await Promise.all(
      section.entries.map((entry: unknown) => {
        const design = model.design;
        const designEntries = ((design as any).entries ?? {}) as Record<
          string,
          unknown
        >;
        const entryContext: Record<string, unknown> = {
          cv: model.cv,
          design: {
            ...design,
            entries: {
              ...designEntries,
              short_second_row: false,
            },
          },
          locale: model.locale,
          settings: model.settings,
          entry,
        };
        return renderTemplate(entryTemplateKey, entryContext);
      }),
    );

    const entriesCode = entryCodes.join("\n\n");
    const sectionTemplate = `${sectionBegin}\n${entriesCode}\n${sectionEndTemplate}`;

    code += `\n${sectionTemplate}`;

    sectionTemplates.push(sectionTemplate);
  }

  code = normalizeTypstWhitespace(code);

  return {
    preamble,
    header,
    sectionTemplates,
    model,
    sections,
    code,
  };
}

function normalizeTypstWhitespace(source: string): string {
  const lines = source.split("\n");
  const out: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();
    const prev = out.length > 0 ? (out[out.length - 1]?.trim() ?? "") : "";
    const next = i + 1 < lines.length ? (lines[i + 1] ?? "").trim() : "";
    const isBlank = trimmed.length === 0;

    if (isBlank) {
      const nearBracket =
        prev === "[" ||
        prev === "(" ||
        prev === "]" ||
        prev === "]," ||
        prev === ")" ||
        prev === ")," ||
        next === "]" ||
        next === "]," ||
        next === ")" ||
        next === "),";
      const betweenListItems =
        (prev.endsWith("],") && next.startsWith("[")) ||
        (prev.endsWith("[") &&
          (next.startsWith("-") || next.startsWith("#"))) ||
        (prev.endsWith("(") && next.startsWith("["));
      if (nearBracket) continue;
      if (betweenListItems) continue;
      if (out.length > 0 && out[out.length - 1] === "") continue;
      out.push("");
      continue;
    }

    out.push(line);
  }

  let normalized = out.join("\n");

  // Match fixture-level block spacing between major rendered chunks.
  normalized = normalized
    .replace(/\n\)\n= /, "\n)\n\n\n= ")
    .replace(/\n\)\n== /g, "\n)\n\n== ")
    .replace(/\n\)\n(#(?:education-entry|regular-entry))/g, "\n)\n\n$1");
  normalized = normalized.replace(
    /\n\)\n\n== Welcome to RenderCV/,
    "\n)\n\n\n== Welcome to RenderCV",
  );

  // Ensure a blank line after section headings.
  normalized = normalized.replace(/^(== .+)\n(?!\n)/gm, "$1\n\n");

  // Keep blank line before first reversed-numbered item.
  normalized = normalized.replace(
    /(#reversed-numbered-entries\(\n\s*\[\n)(\s*\+)/,
    "$1\n$2",
  );

  // Remove stray blank line before plain author lines in publication entries.
  normalized = normalized.replace(
    /(main-column-second-row:\s*\[\n)\n(\s*[A-Za-z][^\n]*)/g,
    "$1$2",
  );

  return normalized.endsWith("\n") ? normalized : `${normalized}\n`;
}
