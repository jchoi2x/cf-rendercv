import { z } from "@hono/zod-openapi";

function toArrayOfStrings(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.map((item) => String(item));
  return [String(value)];
}

type CvRaw = {
  name?: string | null;
  headline?: string | null;
  location?: string | null;
  email?: unknown;
  photo?: string | null;
  phone?: unknown;
  website?: unknown;
  social_networks?: Array<{ network: string; username: string }> | null;
  custom_connections?: Array<{ placeholder: string; url: string | null }> | null;
  sections?: Record<string, unknown[]> | null;
  _plain_name?: string | null;
  _footer?: string | null;
  _top_note?: string | null;
  _connections?: unknown;
  _key_order?: string[] | null;
};

/**
 * Normalize website (first URL) and record field order. Entry bodies stay raw;
 * `processModel` applies RenderCV template expansion (matches upstream Pydantic flow).
 */
function formatCv(raw: CvRaw): CvRaw & Record<string, unknown> {
  const websiteValues = toArrayOfStrings(raw.website).filter(Boolean);
  const website = websiteValues[0] ?? null;
  const keyOrder = Object.keys(raw as Record<string, unknown>).filter(
    (k) => (raw as Record<string, unknown>)[k] != null,
  );
  return {
    ...raw,
    website,
    sections: raw.sections ?? null,
    _plain_name: raw._plain_name ?? raw.name ?? null,
    _key_order: keyOrder,
  };
}

export const ArbitraryDate = z.union([z.number().int(), z.string()]);
export const ExactDate = z.union([z.string(), z.number().int()]);
export const ExistingPathRelativeToInput = z.string().min(1);

export const CustomConnection = z
  .object({
    fontawesome_icon: z.string().describe("Fontawesome Icon"),
    placeholder: z.string().describe("Placeholder"),
    url: z.union([z.string().url().min(1).max(2083), z.null()]).describe("Url"),
  })
  .strict()
  .describe("CustomConnection");

export const SocialNetworkName = z.enum([
  "LinkedIn",
  "GitHub",
  "GitLab",
  "IMDB",
  "Instagram",
  "ORCID",
  "Mastodon",
  "StackOverflow",
  "ResearchGate",
  "YouTube",
  "Google Scholar",
  "Telegram",
  "WhatsApp",
  "Leetcode",
  "X",
  "Bluesky",
  "Reddit",
] as const);

export const SocialNetwork = z
  .object({
    network: SocialNetworkName,
    username: z.string().describe("Username"),
  })
  .strict()
  .describe("SocialNetwork");

export const OneLineEntry = z
  .object({
    label: z.string().describe("Label"),
    details: z.string().describe("Details"),
  })
  .passthrough()
  .describe("OneLineEntry");

export const NormalEntry = z
  .object({
    name: z.string().describe("Name"),
    date: z.union([ArbitraryDate, z.null()]).default(null).optional(),
    start_date: z.union([ExactDate, z.null()]).default(null).optional(),
    end_date: z.union([ExactDate, z.literal("present"), z.null()]).default(null).optional(),
    location: z.union([z.string(), z.null()]).default(null).optional(),
    summary: z.union([z.string(), z.null()]).default(null).optional(),
    highlights: z.union([z.array(z.string()), z.null()]).default(null).optional(),
  })
  .passthrough()
  .describe("NormalEntry");

export const ExperienceEntry = z
  .object({
    company: z.string().describe("Company"),
    position: z.string().describe("Position"),
    date: z.union([ArbitraryDate, z.null()]).default(null).optional(),
    start_date: z.union([ExactDate, z.null()]).default(null).optional(),
    end_date: z.union([ExactDate, z.literal("present"), z.null()]).default(null).optional(),
    location: z.union([z.string(), z.null()]).default(null).optional(),
    summary: z.union([z.string(), z.null()]).default(null).optional(),
    highlights: z.union([z.array(z.string()), z.null()]).default(null).optional(),
  })
  .passthrough()
  .describe("ExperienceEntry");

export const EducationEntry = z
  .object({
    institution: z.string().describe("Institution"),
    area: z.string().describe("Field of study or major."),
    degree: z.union([z.string(), z.null()]).default(null).optional(),
    date: z.union([ArbitraryDate, z.null()]).default(null).optional(),
    start_date: z.union([ExactDate, z.null()]).default(null).optional(),
    end_date: z.union([ExactDate, z.literal("present"), z.null()]).default(null).optional(),
    location: z.union([z.string(), z.null()]).default(null).optional(),
    summary: z.union([z.string(), z.null()]).default(null).optional(),
    highlights: z.union([z.array(z.string()), z.null()]).default(null).optional(),
  })
  .passthrough()
  .describe("EducationEntry");

export const PublicationEntry = z
  .object({
    title: z.string().describe("Title"),
    authors: z.array(z.string()).describe("You can bold your name with **double asterisks**."),
    summary: z.union([z.string(), z.null()]).default(null).optional(),
    doi: z.union([z.string(), z.null()]).default(null).optional(),
    url: z.union([z.string().url().min(1).max(2083), z.null()]).default(null).optional(),
    journal: z.union([z.string(), z.null()]).default(null).optional(),
    date: z.union([ArbitraryDate, z.null()]).default(null).optional(),
  })
  .passthrough()
  .describe("PublicationEntry");

export const BulletEntry = z
  .object({
    bullet: z.string().describe("Bullet"),
  })
  .passthrough()
  .describe("BulletEntry");

export const NumberedEntry = z
  .object({
    number: z.string().describe("Number"),
  })
  .passthrough()
  .describe("NumberedEntry");

export const ReversedNumberedEntry = z
  .object({
    reversed_number: z
      .string()
      .describe(
        "Reverse-numbered list item. Numbering goes in reverse (5, 4, 3, 2, 1), making recent items have higher numbers.",
      ),
  })
  .passthrough()
  .describe("ReversedNumberedEntry");

export const ListOfEntries = z.union([
  z.array(z.string()),
  z.array(OneLineEntry),
  z.array(NormalEntry),
  z.array(ExperienceEntry),
  z.array(EducationEntry),
  z.array(PublicationEntry),
  z.array(BulletEntry),
  z.array(NumberedEntry),
  z.array(ReversedNumberedEntry),
]);

export const Section = ListOfEntries;

const BaseCv = z
  .object({
    name: z.union([z.string(), z.null()]).default(null).optional(),
    _plain_name: z.union([z.string(), z.null()]).default(null).optional(),
    _key_order: z.union([z.array(z.string()), z.null()]).default(null).optional(),
    _footer: z.union([z.string(), z.null()]).default(null).optional(),
    _top_note: z.union([z.string(), z.null()]).default(null).optional(),
    _connections: z.any().default(null).optional(),
    headline: z.union([z.string(), z.null()]).default(null).optional(),
    location: z.union([z.string(), z.null()]).default(null).optional(),
    email: z.any().default(null).optional(),
    photo: z.union([ExistingPathRelativeToInput, z.null()]).default(null).optional(),
    phone: z.any().default(null).optional(),
    website: z
      .union([z.string().url().min(1).max(2083), z.array(z.string().url().min(1).max(2083)), z.null()])
      .default(null)
      .optional(),
    social_networks: z.union([z.array(SocialNetwork), z.null()]).default(null).optional(),
    custom_connections: z.union([z.array(CustomConnection), z.null()]).default(null).optional(),
    sections: z.union([z.object({}).catchall(Section), z.null()]).default(null).optional(),
  })
  .strict();

export const Cv = BaseCv.transform((raw) => formatCv(raw as CvRaw)).describe("Cv");

export const cvSchema = Cv;
export type CvSchemaType = z.infer<typeof cvSchema>;
