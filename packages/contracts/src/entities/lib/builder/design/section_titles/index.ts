import { z } from "@hono/zod-openapi";

export const SECTION_TITLE_TYPES = [
  "with_partial_line",
  "with_full_line",
  "without_line",
  "moderncv",
  "centered_without_line",
  "centered_with_partial_line",
  "centered_with_centered_partial_line",
  "centered_with_full_line",
] as const;

export type SectionTitleType = (typeof SECTION_TITLE_TYPES)[number];

export interface SectionTitles {
  type?: SectionTitleType;
  line_thickness?: string;
  space_above?: string;
  space_below?: string;
}

export const getSectionTitles = (defaults: SectionTitles) => {
  return z.object({
    type: z
      .enum(SECTION_TITLE_TYPES)
      .default(defaults.type ?? "with_partial_line")
      .describe(
        "Section title visual style. The default value is `with_partial_line`.",
      ),
    line_thickness: z
      .string()
      .default(defaults.line_thickness ?? "0.5pt")
      .describe("Line thickness. The default value is `0.5pt`."),
    space_above: z
      .string()
      .default(defaults.space_above ?? "0.5cm")
      .describe("Space above section titles. The default value is `0.5cm`."),
    space_below: z
      .string()
      .default(defaults.space_below ?? "0.3cm")
      .describe("Space below section titles. The default value is `0.3cm`."),
  });
};
