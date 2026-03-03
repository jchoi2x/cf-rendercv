import { z } from "zod";

/**
 * Zod schemas equivalent to the RenderCV YAML input file schema.
 * @see https://docs.rendercv.com/user_guide/yaml_input_structure/
 * @see https://raw.githubusercontent.com/rendercv/rendercv/main/schema.json
 *
 * The YAML file has four top-level fields: cv (required), design, locale, settings.
 */

// ─── Primitives ───────────────────────────────────────────────────────────────

/** YYYY-MM-DD, YYYY-MM, or YYYY. Used for start_date and end_date. */
const ExactDateString = z
  .union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
    z.string().regex(/^\d{4}-\d{2}$/, "YYYY-MM"),
    z.string().regex(/^\d{4}$/, "YYYY"),
  ])
  .describe(
    "The start or end date in YYYY-MM-DD, YYYY-MM, or YYYY format."
  );

/** Exact date or the literal 'present' for ongoing events. */
const EndDateString = z
  .union([ExactDateString, z.literal("present")])
  .describe(
    "End date in YYYY-MM-DD, YYYY-MM, or YYYY format. Use 'present' for ongoing events."
  );

/** Single date or custom text (e.g. 'Fall 2023'). Overrides start_date/end_date when set. */
const ArbitraryDate = z
  .union([
    z.string().regex(/^\d{4}(-\d{2})?(-\d{2})?$/),
    z.string().min(1),
    z.number().int(),
  ])
  .describe(
    "Date in YYYY-MM-DD, YYYY-MM, YYYY, or any custom text like 'Fall 2023'. Use for single or imprecise dates; for ranges use start_date and end_date."
  );

// ─── Social & connections ────────────────────────────────────────────────────

/** Supported RenderCV social network names. */
const SocialNetworkName = z
  .enum([
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
  ])
  .describe(
    "The social platform name. Must be one of the supported RenderCV networks."
  );

const SocialNetworkSchema = z
  .object({
    network: SocialNetworkName,
    username: z
      .string()
      .min(1)
      .describe(
        "Username or profile path. For StackOverflow use 'userId/display-name'; for Mastodon use full handle (e.g. @user@instance)."
      ),
  })
  .describe("A social or professional profile link in the header.");

/** Custom link with display text and optional URL; uses Font Awesome icon name. */
const CustomConnectionSchema = z
  .object({
    placeholder: z
      .string()
      .min(1)
      .describe("Display text for the link (e.g. 'Book a call')."),
    url: z
      .string()
      .url()
      .nullable()
      .describe(
        "URL for the link. Omit or null for plain text without a link."
      ),
    fontawesome_icon: z
      .string()
      .min(1)
      .describe(
        "Font Awesome icon name (e.g. 'calendar-days', 'envelope'). See https://fontawesome.com/search"
      ),
  })
  .describe(
    "Additional header connection with custom text and Font Awesome icon."
  );

// ─── Entry types (RenderCV’s 9 entry kinds) ────────────────────────────────────

/** Academic credentials. degree is optional in RenderCV. */
const EducationEntrySchema = z
  .object({
    institution: z
      .string()
      .min(1)
      .describe("School, university, or institution name."),
    area: z.string().min(1).describe("Field of study (e.g. Computer Science)."),
    degree: z
      .string()
      .optional()
      .describe("Degree type (e.g. BS, MS, PhD)."),
    date: ArbitraryDate.optional().describe(
      "Custom date string; overrides start_date/end_date when set."
    ),
    start_date: ExactDateString.optional().describe(
      "Start date in YYYY-MM-DD, YYYY-MM, or YYYY."
    ),
    end_date: EndDateString.optional().describe(
      "End date or 'present'. Omit if ongoing."
    ),
    location: z.string().optional().describe("Institution location."),
    summary: z.string().optional().describe("Brief description."),
    highlights: z
      .array(z.string())
      .optional()
      .describe(
        "Bullet points (e.g. GPA, awards, relevant coursework). Supports Markdown and Typst."
      ),
  })
  .passthrough()
  .describe("EducationEntry: for academic credentials.");

/** Work history and professional roles. */
const ExperienceEntrySchema = z
  .object({
    company: z.string().min(1).describe("Employer or company name."),
    position: z.string().min(1).describe("Job title."),
    date: ArbitraryDate.optional().describe(
      "Custom date string; overrides start_date/end_date when set."
    ),
    start_date: ExactDateString.optional().describe(
      "First day of employment (YYYY-MM-DD, YYYY-MM, or YYYY)."
    ),
    end_date: EndDateString.optional().describe(
      "Last day or 'present'. Omit if current role."
    ),
    location: z.string().optional().describe("Office or location (e.g. Remote)."),
    summary: z.string().optional().describe("Role description paragraph."),
    highlights: z
      .array(z.string())
      .optional()
      .describe(
        "Bullet-point achievements. Use **bold** and [text](url); supports Typst."
      ),
  })
  .passthrough()
  .describe("ExperienceEntry: for work history.");

/** Flexible entry for projects, awards, certifications, etc. */
const NormalEntrySchema = z
  .object({
    name: z.string().min(1).describe("Entry title (e.g. project or award name)."),
    date: ArbitraryDate.optional().describe(
      "Custom date string; overrides start_date/end_date when set."
    ),
    start_date: ExactDateString.optional(),
    end_date: EndDateString.optional(),
    location: z.string().optional(),
    summary: z.string().optional(),
    highlights: z.array(z.string()).optional().describe("Bullet points."),
  })
  .passthrough()
  .describe("NormalEntry: for projects, awards, certifications, and similar.");

/** Papers, articles, and other publications. */
const PublicationEntrySchema = z
  .object({
    title: z.string().min(1).describe("Publication title."),
    authors: z
      .array(z.string())
      .min(1)
      .describe(
        "List of author names. Use **Name** to bold (e.g. for self)."
      ),
    doi: z
      .string()
      .regex(/^10\./)
      .optional()
      .describe(
        "Digital Object Identifier. If set, used as link instead of url."
      ),
    url: z.string().url().optional().describe("Link to the publication."),
    journal: z
      .string()
      .optional()
      .describe("Journal, conference, or venue name."),
    date: ArbitraryDate.optional().describe("Publication date."),
    summary: z.string().optional(),
  })
  .passthrough()
  .describe("PublicationEntry: for papers and publications.");

/** Compact key-value row (e.g. skills, languages). */
const OneLineEntrySchema = z
  .object({
    label: z
      .string()
      .min(1)
      .describe("Category name (e.g. 'Languages', 'Citizenship')."),
    details: z
      .string()
      .min(1)
      .describe(
        "Associated details (e.g. 'Python, C++, JavaScript' or 'US Citizen')."
      ),
  })
  .passthrough()
  .describe("OneLineEntry: for compact key-value pairs such as skills.");

/** A single bullet line. */
const BulletEntrySchema = z
  .object({
    bullet: z
      .string()
      .min(1)
      .describe(
        "The bullet text. Supports Markdown and Typst."
      ),
  })
  .passthrough()
  .describe("BulletEntry: a single bullet point.");

/** Automatically numbered list item. */
const NumberedEntrySchema = z
  .object({
    number: z
      .string()
      .min(1)
      .describe("Content of this numbered item."),
  })
  .passthrough()
  .describe("NumberedEntry: an automatically numbered list entry.");

/** Numbered list that counts down (e.g. recent publications first). */
const ReversedNumberedEntrySchema = z
  .object({
    reversed_number: z
      .string()
      .min(1)
      .describe(
        "Content of this item. Numbering is reversed (e.g. 5, 4, 3…) so recent items get higher numbers."
      ),
  })
  .passthrough()
  .describe("ReversedNumberedEntry: reverse-numbered list entry.");

/**
 * A single structured entry (any of the 8 object-based entry types).
 * A section value is an array of exactly one entry type (RenderCV does not allow mixing types in one section).
 * TextEntry is represented as an array of plain strings.
 */
const _SectionEntrySchema = z.union([
  EducationEntrySchema,
  ExperienceEntrySchema,
  NormalEntrySchema,
  PublicationEntrySchema,
  OneLineEntrySchema,
  BulletEntrySchema,
  NumberedEntrySchema,
  ReversedNumberedEntrySchema,
]);

/** Section content: either text lines (TextEntry) or a list of one of the 8 structured entry types. */
const SectionSchema = z.union([
  z.array(z.string()).describe("TextEntry: plain text lines (e.g. for Summary)."),
  z.array(EducationEntrySchema),
  z.array(ExperienceEntrySchema),
  z.array(NormalEntrySchema),
  z.array(PublicationEntrySchema),
  z.array(OneLineEntrySchema),
  z.array(BulletEntrySchema),
  z.array(NumberedEntrySchema),
  z.array(ReversedNumberedEntrySchema),
]);

/** Sections: keys are section titles (e.g. Experience, Education), values are lists of entries. */
const SectionsSchema = z
  .record(z.string(), SectionSchema)
  .describe(
    "CV sections. Keys are section titles; values are lists of entries. Each section uses only one entry type. Entry type is inferred from fields."
  );

// ─── CV (header + sections) ───────────────────────────────────────────────────

/** Email or list of emails. */
const EmailSchema = z.union([
  z.string().email(),
  z.array(z.string().email()).min(1),
]).optional().nullable();

/** Phone or list of phone numbers. Display format is controlled by design.header.connections.phone_number_format. */
const PhoneSchema = z
  .union([
    z.string().min(1),
    z.array(z.string().min(1)).min(1),
  ])
  .optional()
  .nullable();

/** Website URL or list of URLs. */
const WebsiteSchema = z
  .union([
    z.string().url(),
    z.array(z.string().url()).min(1),
  ])
  .optional()
  .nullable();

const CVSchema = z
  .object({
    name: z
      .string()
      .optional()
      .nullable()
      .describe("Full name displayed at the top of the CV."),
    headline: z
      .string()
      .optional()
      .nullable()
      .describe("Professional headline (e.g. 'Machine Learning Engineer')."),
    location: z
      .string()
      .optional()
      .nullable()
      .describe("City and country/region (e.g. 'San Francisco, CA')."),
    email: EmailSchema.describe(
      "Primary contact email. You can provide multiple emails as a list."
    ),
    phone: PhoneSchema.describe(
      "Phone number(s). International format recommended (e.g. +1 for USA). Multiple numbers as list."
    ),
    website: WebsiteSchema.describe(
      "Personal website or portfolio. Multiple URLs as list."
    ),
    photo: z
      .string()
      .optional()
      .nullable()
      .describe(
        "Photo file path relative to the YAML file (e.g. 'photo.jpg', 'images/profile.png')."
      ),
    social_networks: z
      .array(SocialNetworkSchema)
      .optional()
      .nullable()
      .describe("Social and professional profile links in the header."),
    custom_connections: z
      .array(CustomConnectionSchema)
      .optional()
      .nullable()
      .describe(
        "Custom header links with placeholder text and Font Awesome icon."
      ),
    sections: SectionsSchema.optional().nullable().describe(
      "Main CV content. Keys are section titles; values are lists of entries. Only one entry type per section."
    ),
  })
  .describe(
    "Root CV object: header info (name, headline, contact, photo, links) and sections. All header fields are optional; RenderCV adapts to what you provide."
  );

// ─── Design (optional) ────────────────────────────────────────────────────────

/** Built-in theme name. */
const ThemeName = z
  .enum([
    "classic",
    "engineeringclassic",
    "engineeringresumes",
    "moderncv",
    "sb2nov",
  ])
  .describe(
    "Built-in theme. classic is default. All themes share the same options; only defaults differ."
  );

/** Minimal design schema; full design has page, colors, typography, links, header, section_titles, sections, entries, templates. */
const DesignSchema = z
  .object({
    theme: ThemeName.optional().describe("Theme name. Defaults to 'classic'."),
  })
  .passthrough()
  .describe(
    "Visual design: theme, colors, fonts, spacing, layout. Omit to use classic theme defaults."
  );

// ─── Locale (optional) ───────────────────────────────────────────────────────

/** Built-in locale/language code. */
const LocaleLanguage = z
  .enum([
    "english",
    "arabic",
    "danish",
    "dutch",
    "french",
    "german",
    "hebrew",
    "hindi",
    "indonesian",
    "italian",
    "japanese",
    "korean",
    "mandarin_chinese",
    "norwegian_bokmål",
    "norwegian_nynorsk",
    "persian",
    "portuguese",
    "russian",
    "spanish",
    "turkish",
  ])
  .describe("Language for month names, 'present', and other locale strings.");

const LocaleSchema = z
  .object({
    language: LocaleLanguage.optional().describe("Built-in language. Defaults to 'english'."),
    last_updated: z.string().optional().describe("Translation of 'Last updated in'."),
    month: z.string().optional().describe("Translation of 'month' (singular)."),
    months: z.string().optional().describe("Translation of 'months' (plural)."),
    year: z.string().optional().describe("Translation of 'year' (singular)."),
    years: z.string().optional().describe("Translation of 'years' (plural)."),
    present: z.string().optional().describe("Translation of 'present' for ongoing dates."),
    month_abbreviations: z.array(z.string()).length(12).optional().describe("Month abbreviations (Jan–Dec)."),
    month_names: z.array(z.string()).length(12).optional().describe("Full month names (January–December)."),
  })
  .passthrough()
  .describe(
    "Locale for language-specific strings (month names, 'present', etc.). Omit for English."
  );

// ─── Settings (optional) ──────────────────────────────────────────────────────

const SettingsSchema = z
  .object({
    current_date: z
      .union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("YYYY-MM-DD"),
        z.literal("today"),
      ])
      .optional()
      .describe(
        "Date used for filenames, 'last updated' label, and time-span calculations. Defaults to actual current date."
      ),
    bold_keywords: z
      .array(z.string())
      .optional()
      .describe(
        "Keywords to automatically bold wherever they appear in the CV text."
      ),
    pdf_title: z
      .string()
      .optional()
      .describe(
        "PDF document title (browser tab, reader). Placeholders: NAME, CURRENT_DATE, MONTH_NAME, YEAR, etc."
      ),
  })
  .passthrough()
  .describe(
    "RenderCV behavior: current date, bold keywords, output paths, file generation options."
  );

// ─── Root: RenderCV YAML document ─────────────────────────────────────────────

/**
 * Root schema for the RenderCV YAML input file.
 * Only `cv` is required; design, locale, and settings have sensible defaults.
 */
export const RenderCVYamlSchema = z.object({
  cv: CVSchema.describe("The content of the CV (required)."),
  design: DesignSchema.optional().describe(
    "Visual design. Defaults to the 'classic' theme."
  ),
  locale: LocaleSchema.optional().describe(
    "Locale catalog for multiple languages. Defaults to English."
  ),
  settings: SettingsSchema.optional().describe("RenderCV settings."),
});

// ─── Exports & inferred types ──────────────────────────────────────────────────

export type RenderCVYaml = z.infer<typeof RenderCVYamlSchema>;
export type CV = z.infer<typeof CVSchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type NormalEntry = z.infer<typeof NormalEntrySchema>;
export type PublicationEntry = z.infer<typeof PublicationEntrySchema>;
export type OneLineEntry = z.infer<typeof OneLineEntrySchema>;
export type BulletEntry = z.infer<typeof BulletEntrySchema>;
export type NumberedEntry = z.infer<typeof NumberedEntrySchema>;
export type ReversedNumberedEntry = z.infer<typeof ReversedNumberedEntrySchema>;
export type SectionEntry = z.infer<typeof _SectionEntrySchema>;
export type SocialNetwork = z.infer<typeof SocialNetworkSchema>;
export type CustomConnection = z.infer<typeof CustomConnectionSchema>;

