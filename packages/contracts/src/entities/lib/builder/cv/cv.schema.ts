import { z } from "@hono/zod-openapi";

import { ExistingPathRelativeToInput } from "./common/existing-path-relative-to-input";
import { CustomConnection } from "./custom-connection";
import { Section } from "./section";
import { SocialNetwork } from "./social-network";

// function toArrayOfStrings(value: unknown): string[] {
//   if (value === null || value === undefined) return [];
//   if (Array.isArray(value)) return value.map((item) => String(item));
//   return [String(value)];
// }
// /**
//  * Normalize website (first URL) and record field order. Entry bodies stay raw;
//  * `processModel` applies RenderCV template expansion (matches upstream Pydantic flow).
//  */
// function formatCv(raw: CvRaw): CvRaw & Record<string, unknown> {
//   const websiteValues = toArrayOfStrings(raw.website).filter(Boolean);
//   const website = websiteValues[0] ?? null;
//   const keyOrder = Object.keys(raw as Record<string, unknown>).filter(
//     (k) => (raw as Record<string, unknown>)[k] != null,
//   );
//   return {
//     ...raw,
//     website,
//     sections: raw.sections ?? null,
//     _plain_name: raw._plain_name ?? raw.name ?? null,
//     _key_order: keyOrder,
//   };
// }

export const Cv = z
  .object({
    name: z
      .union([z.string(), z.null()])
      .describe("Name")
      .default(null)
      .optional(),
    // _plain_name: z
    //   .union([z.string(), z.null()])
    //   .describe("Plain Name")
    //   .default(null)
    //   .optional(),
    // _footer: z
    //   .union([z.string(), z.null()])
    //   .describe("Footer text")
    //   .default(null)
    //   .optional(),
    // _top_note: z
    //   .union([z.string(), z.null()])
    //   .describe("Top note text")
    //   .default(null)
    //   .optional(),
    // _connections: z
    //   .union([z.array(CustomConnection), z.null()])
    //   .describe("Connections")
    //   .default(null)
    //   .optional(),
    headline: z
      .union([z.string(), z.null()])
      .describe("Headline")
      .default(null)
      .optional(),
    location: z
      .union([z.string(), z.null()])
      .describe("Location")
      .default(null)
      .optional(),
    email: z
      .any()
      .describe("You can provide multiple emails as a list.")
      .default(null)
      .optional(),
    photo: z
      .union([ExistingPathRelativeToInput, z.null()])
      .describe("Photo file path, relative to the YAML file.")
      .default(null)
      .optional(),
    phone: z
      .any()
      .describe(
        "Your phone number with country code in international format (e.g., +1 for USA, +44 for UK). The display format in the output is controlled by `design.header.connections.phone_number_format`. You can provide multiple numbers as a list.",
      )
      .default(null)
      .optional(),
    website: z
      .any()
      .describe("You can provide multiple URLs as a list.")
      .default(null)
      .optional(),
    social_networks: z
      .union([z.array(SocialNetwork), z.null()])
      .describe("Social Networks")
      .default(null)
      .optional(),
    custom_connections: z
      .union([z.array(CustomConnection), z.null()])
      .describe(
        "Additional header connections you define yourself. Each item has a `placeholder` (the displayed text), an optional `url`, and the Font Awesome icon name to render (from https://fontawesome.com/search).",
      )
      .default(null)
      .optional(),
    sections: z
      .union([z.object({}).catchall(Section), z.null()])
      .describe(
        "The sections of your CV. Keys are section titles (e.g., Experience, Education), and values are lists of entries. Entry types are automatically detected based on their fields.",
      )
      .default(null)
      .optional(),
  })
  .strict()
  .describe("Cv");

export type CvSchema = z.infer<typeof Cv>;
