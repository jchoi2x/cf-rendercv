import { z } from "@hono/zod-openapi";

const BULLETS = ["●", "•", "◦", "-", "◆", "★", "■", "—", "○"] as const;
type Bullet = (typeof BULLETS)[number];

export interface Summary {
  space_above?: string;
  space_left?: string;
}

export interface Highlights {
  bullet?: Bullet;
  nested_bullet?: Bullet;
  space_left?: string;
  space_above?: string;
  space_between_items?: string;
  space_between_bullet_and_text?: string;
}

export interface Entries {
  date_and_location_width?: string;
  side_space?: string;
  space_between_columns?: string;
  allow_page_break?: boolean;
  short_second_row?: boolean;
  degree_width?: string;
  summary?: Summary;
  highlights?: Highlights;
}

const getSummary = (defaults: Summary) => {
  return z.object({
    space_above: z
      .string()
      .default(defaults.space_above ?? "0cm")
      .describe("Space above summary text. The default value is `0cm`."),
    space_left: z
      .string()
      .default(defaults.space_left ?? "0cm")
      .describe("Left margin for summary text. The default value is `0cm`."),
  });
};

const getHighlights = (defaults: Highlights) => {
  return z.object({
    bullet: z
      .enum(BULLETS)
      .default(defaults.bullet ?? "•")
      .describe("Bullet character for highlights. The default value is `•`."),
    nested_bullet: z
      .enum(BULLETS)
      .default(defaults.nested_bullet ?? "•")
      .describe(
        "Bullet character for nested highlights. The default value is `•`.",
      ),
    space_left: z
      .string()
      .default(defaults.space_left ?? "0.15cm")
      .describe("Left indentation. The default value is `0.15cm`."),
    space_above: z
      .string()
      .default(defaults.space_above ?? "0cm")
      .describe("Space above highlights. The default value is `0cm`."),
    space_between_items: z
      .string()
      .default(defaults.space_between_items ?? "0cm")
      .describe("Space between highlight items. The default value is `0cm`."),
    space_between_bullet_and_text: z
      .string()
      .default(defaults.space_between_bullet_and_text ?? "0.5em")
      .describe("Space between bullet and text. The default value is `0.5em`."),
  });
};

export const getEntries = (defaults: Entries) => {
  return z.object({
    date_and_location_width: z
      .string()
      .default(defaults.date_and_location_width ?? "4.15cm")
      .describe(
        "Width of the date/location column. The default value is `4.15cm`.",
      ),
    side_space: z
      .string()
      .default(defaults.side_space ?? "0.2cm")
      .describe("Left and right margins. The default value is `0.2cm`."),
    space_between_columns: z
      .string()
      .default(defaults.space_between_columns ?? "0.1cm")
      .describe(
        "Space between main content and date/location columns. The default value is `0.1cm`.",
      ),
    allow_page_break: z
      .boolean()
      .default(defaults.allow_page_break ?? false)
      .describe(
        "Allow page breaks within entries. If false, entries that don't fit move to a new page. The default value is `false`.",
      ),
    short_second_row: z
      .boolean()
      .default(defaults.short_second_row ?? true)
      .describe(
        "Shorten the second row to align with the date/location column. The default value is `true`.",
      ),
    degree_width: z
      .string()
      .default(defaults.degree_width ?? "1cm")
      .describe("Width of the degree column. The default value is `1cm`."),
    summary: getSummary(defaults.summary ?? {}),
    highlights: getHighlights(defaults.highlights ?? {}),
  });
};
