import { z } from "@hono/zod-openapi";

export interface Sections {
  allow_page_break?: boolean;
  space_between_regular_entries?: string;
  space_between_text_based_entries?: string;
  show_time_spans_in?: string[];
}

export const getSections = (defaults: Sections) => {
  return z.object({
    allow_page_break: z
      .boolean()
      .default(defaults.allow_page_break ?? true)
      .describe(
        "Allow page breaks within sections. If false, sections that don't fit will start on a new page. The default value is `true`.",
      ),
    space_between_regular_entries: z
      .string()
      .default(defaults.space_between_regular_entries ?? "1.2em")
      .describe(
        "Vertical space between entries. The default value is `1.2em`.",
      ),
    space_between_text_based_entries: z
      .string()
      .default(defaults.space_between_text_based_entries ?? "0.3em")
      .describe(
        "Vertical space between text-based entries. The default value is `0.3em`.",
      ),
    show_time_spans_in: z
      .array(z.string())
      .default(defaults.show_time_spans_in ?? ["experience"])
      .transform((titles) =>
        titles.map((title) => title.toLowerCase().trim().replace(/\s+/g, "_")),
      )
      .describe(
        "Section titles where time spans (e.g., '2 years 3 months') should be displayed.",
      ),
  });
};
