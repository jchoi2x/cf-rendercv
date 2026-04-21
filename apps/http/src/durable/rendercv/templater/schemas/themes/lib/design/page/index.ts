import { z } from "@hono/zod-openapi";

export interface Page {
  size?: "a4" | "a5" | "us-letter" | "us-executive";
  top_margin?: string;
  bottom_margin?: string;
  left_margin?: string;
  right_margin?: string;
  show_footer?: boolean;
  show_top_note?: boolean;
}

export const getPage = (defaults: Page) => {
  return z.object({
    size: z.enum(["a4", "a5", "us-letter", "us-executive"])
      .default(defaults.size ?? "us-letter")
      .describe("The page size. Use 'a4' (international standard) or 'us-letter' (US standard). The default value is `us-letter`."),
    top_margin: z.string()
      .default(defaults.top_margin ?? '0.7in')
      .describe("It can be specified with units (cm, in, pt, mm, em). For example, `0.1cm`. The default value is `0.7in`."),
    bottom_margin: z.string()
      .default(defaults.bottom_margin ?? '0.7in')
      .describe("It can be specified with units (cm, in, pt, mm, em). For example, `0.1cm`. The default value is `0.7in`."),
    left_margin: z.string()
      .default(defaults.left_margin ?? '0.7in')
      .describe("It can be specified with units (cm, in, pt, mm, em). For example, `0.1cm`. The default value is `0.7in`."),
    right_margin: z.string()
      .default(defaults.right_margin ?? '0.7in')
      .describe("It can be specified with units (cm, in, pt, mm, em). For example, `0.1cm`. The default value is `0.7in`."),
    show_footer: z.boolean()
      .default(defaults.show_footer ?? true)
      .describe("Show the footer at the bottom of pages. The default value is `true`."),
    show_top_note: z.boolean()
      .default(defaults.show_top_note ?? true)
      .describe("Show the top note at the top of the first page. The default value is `true`."),
  });
}


