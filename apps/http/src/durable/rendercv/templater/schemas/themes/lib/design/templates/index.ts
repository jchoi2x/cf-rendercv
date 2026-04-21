import { z } from "@hono/zod-openapi";

export interface Templates {
  footer?: string;
  top_note?: string;
  single_date?: string;
  date_range?: string;
  time_span?: string;
  one_line_entry?: {
    main_column?: string;
  };
  education_entry?: {
    main_column?: string;
    degree_column?: string | null;
    date_and_location_column?: string;
  };
  normal_entry?: {
    main_column?: string;
    date_and_location_column?: string;
  };
  experience_entry?: {
    main_column?: string;
    date_and_location_column?: string;
  };
  publication_entry?: {
    main_column?: string;
    date_and_location_column?: string;
  };
}

export const getTemplates = (defaults: Templates) => {
  return z.object({
    footer: z
      .string()
      .default(defaults.footer ?? "*NAME -- PAGE_NUMBER/TOTAL_PAGES*"),
    top_note: z
      .string()
      .default(defaults.top_note ?? "*LAST_UPDATED CURRENT_DATE*"),
    single_date: z
      .string()
      .default(defaults.single_date ?? "MONTH_ABBREVIATION YEAR"),
    date_range: z.string().default(defaults.date_range ?? "START_DATE – END_DATE"),
    time_span: z
      .string()
      .default(defaults.time_span ?? "HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS"),
    one_line_entry: z.object({
      main_column: z
        .string()
        .default(defaults.one_line_entry?.main_column ?? "**LABEL:** DETAILS"),
    }),
    education_entry: z.object({
      main_column: z
        .string()
        .default(
          defaults.education_entry?.main_column ??
            "**INSTITUTION**, AREA\nSUMMARY\nHIGHLIGHTS",
        ),
      degree_column: z
        .string()
        .nullable()
        .default(defaults.education_entry?.degree_column ?? "**DEGREE**"),
      date_and_location_column: z
        .string()
        .default(defaults.education_entry?.date_and_location_column ?? "LOCATION\nDATE"),
    }),
    normal_entry: z.object({
      main_column: z
        .string()
        .default(defaults.normal_entry?.main_column ?? "**NAME**\nSUMMARY\nHIGHLIGHTS"),
      date_and_location_column: z
        .string()
        .default(defaults.normal_entry?.date_and_location_column ?? "LOCATION\nDATE"),
    }),
    experience_entry: z.object({
      main_column: z
        .string()
        .default(
          defaults.experience_entry?.main_column ??
            "**COMPANY**, POSITION\nSUMMARY\nHIGHLIGHTS",
        ),
      date_and_location_column: z
        .string()
        .default(defaults.experience_entry?.date_and_location_column ?? "LOCATION\nDATE"),
    }),
    publication_entry: z.object({
      main_column: z
        .string()
        .default(
          defaults.publication_entry?.main_column ??
            "**TITLE**\nSUMMARY\nAUTHORS\nURL (JOURNAL)",
        ),
      date_and_location_column: z
        .string()
        .default(defaults.publication_entry?.date_and_location_column ?? "DATE"),
    }),
  });
};
