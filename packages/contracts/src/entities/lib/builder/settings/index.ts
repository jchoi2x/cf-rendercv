import { z } from "@hono/zod-openapi";

import { ExistingPathRelativeToInput } from "../cv/common/existing-path-relative-to-input";

const PlannedPathRelativeToInput = z
  .string()
  .min(1)
  .describe("Planned path relative to the input file.");

export const RenderCommand = z
  .object({
    output_folder: PlannedPathRelativeToInput.optional(),
    design: z
      .union([ExistingPathRelativeToInput, z.null()])
      .describe("Path to a YAML file containing the `design` field.")
      .default(null)
      .optional(),
    locale: z
      .union([ExistingPathRelativeToInput, z.null()])
      .describe("Path to a YAML file containing the `locale` field.")
      .default(null)
      .optional(),
    typst_path: PlannedPathRelativeToInput.optional(),
    pdf_path: PlannedPathRelativeToInput.optional(),
    markdown_path: PlannedPathRelativeToInput.optional(),
    html_path: PlannedPathRelativeToInput.optional(),
    png_path: PlannedPathRelativeToInput.optional(),
    dont_generate_markdown: z
      .boolean()
      .describe(
        "Skip Markdown generation. This also disables HTML generation. The default value is `false`.",
      )
      .default(false)
      .optional(),
    dont_generate_html: z
      .boolean()
      .describe("Skip HTML generation. The default value is `false`.")
      .default(false)
      .optional(),
    dont_generate_typst: z
      .boolean()
      .describe(
        "Skip Typst generation. This also disables PDF and PNG generation. The default value is `false`.",
      )
      .default(false)
      .optional(),
    dont_generate_pdf: z
      .boolean()
      .describe("Skip PDF generation. The default value is `false`.")
      .default(false)
      .optional(),
    dont_generate_png: z
      .boolean()
      .describe("Skip PNG generation. The default value is `false`.")
      .default(false)
      .optional(),
  })
  .strict()
  .describe("RenderCommand");

export const Settings = z
  .object({
    current_date: z
      .union([z.string(), z.literal("today")])
      .describe(
        'The date to use as "current date" for filenames, the "last updated" label, and time span calculations. Defaults to the actual current date.',
      )
      .default("today")
      .optional(),
    render_command: RenderCommand.optional(),
    bold_keywords: z
      .array(z.string())
      .describe("Keywords to automatically bold in the output.")
      .default([])
      .optional(),
    pdf_title: z
      .string()
      .describe(
        "Title metadata for the PDF document. This appears in browser tabs and PDF readers. Available placeholders:\n- `NAME`: The CV owner's name from `cv.name`\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `NAME - CV`.",
      )
      .default("NAME - CV")
      .optional(),
  })
  .strict()
  .describe("Settings");

export type TSettingsSchema = z.infer<typeof Settings>;
