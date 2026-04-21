import { inferEntryType } from "./infer-entry-type";
import { normalizeEntry } from "./normalize-entry";
import type { RenderSection } from "./types";

function toText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

export function buildSections(
  payload: Record<string, unknown>,
): RenderSection[] {
  const cv = (payload.cv ?? {}) as Record<string, unknown>;

  const sections: RenderSection[] = [];
  const processed = cv.rendercv_sections;
  if (Array.isArray(processed)) {
    for (const section of processed as Array<Record<string, unknown>>) {
      const title = toText(section.title).trim();
      const rawEntries = Array.isArray(section.entries) ? section.entries : [];
      sections.push({
        title,
        snake_case_title: toText(section.snake_case_title).trim().toLowerCase(),
        entry_type: toText(section.entry_type, inferEntryType(rawEntries)),
        entries: rawEntries.map((entry) => normalizeEntry(entry)),
      });
    }
    return sections;
  }

  const sectionMap = (cv.sections ?? {}) as Record<string, unknown>;
  for (const [title, values] of Object.entries(sectionMap)) {
    const rawEntries = Array.isArray(values) ? values : [values];
    sections.push({
      title,
      snake_case_title: title.trim().replace(/\s+/g, "_").toLowerCase(),
      entry_type: inferEntryType(rawEntries),
      entries: rawEntries.map((entry) => normalizeEntry(entry)),
    });
  }
  return sections;
}
