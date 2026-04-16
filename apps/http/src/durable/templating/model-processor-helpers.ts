type StringProcessor = (value: string) => string;

type DateLike = {
  year: number;
  month: number;
  day: number;
};

type LocaleLike = {
  last_updated?: string;
  month_abbreviations?: string[];
  month_names?: string[];
};

export function applyStringProcessors(
  value: string | null | undefined,
  stringProcessors: StringProcessor[],
): string | null | undefined {
  if (value == null) return value;
  return stringProcessors.reduce((acc, fn) => fn(acc), value);
}

export function makeKeywordsBold(value: string, keywords: string[]): string {
  if (!keywords.length) return value;
  const escaped = keywords
    .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "g");
  return value.replace(pattern, "**$1**");
}

export function substitutePlaceholders(
  template: string,
  placeholders: Record<string, string>,
): string {
  const keys = Object.keys(placeholders);
  if (!keys.length) return template;
  const escaped = keys
    .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");
  return template
    .replace(pattern, (match) => placeholders[match] ?? match)
    .trim();
}

export function markdownToTypst(value: string): string {
  return value
    .replace(/\[(.+?)\]\((.+?)\)/g, '#link("$2")[$1]')
    .replace(/\*\*(.+?)\*\*/g, "#strong[$1]")
    .replace(/\*(.+?)\*/g, "#emph[$1]")
    .replace(/(?<!\\)%/g, "\\%")
    .replace(/(?<!\\)\$/g, "\\$")
    .replaceAll("@", "\\@");
}

export function buildDatePlaceholders(
  date: DateLike,
  locale: LocaleLike,
): Record<string, string> {
  const { year, month, day } = date;
  const monthNames = locale.month_names ?? [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthAbbreviations = locale.month_abbreviations ?? [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  return {
    MONTH_NAME: monthNames[month - 1] ?? String(month),
    MONTH_ABBREVIATION: monthAbbreviations[month - 1] ?? String(month),
    MONTH: String(month),
    MONTH_IN_TWO_DIGITS: String(month).padStart(2, "0"),
    DAY: String(day),
    DAY_IN_TWO_DIGITS: String(day).padStart(2, "0"),
    YEAR: String(year),
    YEAR_IN_TWO_DIGITS: String(year).slice(-2),
  };
}

export function dateObjectToString(
  date: DateLike,
  locale: LocaleLike,
  singleDateTemplate: string,
): string {
  return substitutePlaceholders(
    singleDateTemplate,
    buildDatePlaceholders(date, locale),
  );
}

export function renderTopNoteTemplate({
  topNoteTemplate,
  locale,
  currentDate,
  name,
  singleDateTemplate,
  stringProcessors,
}: {
  topNoteTemplate: string;
  locale: LocaleLike;
  currentDate: DateLike;
  name: string;
  singleDateTemplate: string;
  stringProcessors: StringProcessor[];
}): string {
  const placeholders = {
    CURRENT_DATE: dateObjectToString(currentDate, locale, singleDateTemplate),
    LAST_UPDATED: locale.last_updated ?? "Last updated in",
    NAME: name,
    ...buildDatePlaceholders(currentDate, locale),
  };
  const resolved = substitutePlaceholders(topNoteTemplate, placeholders);
  return (applyStringProcessors(resolved, stringProcessors) as string) ?? "";
}

export function renderFooterTemplate({
  footerTemplate,
  locale,
  currentDate,
  name,
  singleDateTemplate,
  stringProcessors,
}: {
  footerTemplate: string;
  locale: LocaleLike;
  currentDate: DateLike;
  name: string;
  singleDateTemplate: string;
  stringProcessors: StringProcessor[];
}): string {
  const placeholders = {
    CURRENT_DATE: dateObjectToString(currentDate, locale, singleDateTemplate),
    NAME: name,
    PAGE_NUMBER: "#str(here().page())",
    TOTAL_PAGES: "#str(counter(page).final().first())",
    ...buildDatePlaceholders(currentDate, locale),
  };
  const resolved = substitutePlaceholders(footerTemplate, placeholders);
  const processed =
    (applyStringProcessors(resolved, stringProcessors) as string) ?? "";
  return `context { [${processed}] }`;
}

export function renderEntryTemplates<T>(
  entry: T,
  options?: {
    theme?: string;
    educationStyle?: "default" | "separate-degree-line";
  },
): T {
  if (!entry || typeof entry !== "object") return entry;
  const data = { ...(entry as Record<string, unknown>) };

  const date = processDate({
    date: data.date,
    startDate: data.start_date,
    endDate: data.end_date,
  });

  if (data.institution || data.degree || data.area) {
    const degree = asText(data.degree);
    const area = asText(data.area);
    const institution = asText(data.institution);
    const location = asText(data.location);
    const highlights = processHighlights(data.highlights);
    const useSeparateDegreeLine =
      options?.educationStyle === "separate-degree-line" ||
      options?.theme === "sb2nov";

    if (useSeparateDegreeLine) {
      const degreeLine = [degree, degree && area ? "in" : "", area]
        .filter(Boolean)
        .map((part) => emph(part))
        .join(" ");
      data.date_and_location_column = [location, date]
        .filter(Boolean)
        .map((part) => emph(part))
        .join("\n");
      data.degree_column = "";
      data.main_column = [strong(institution), degreeLine, highlights]
        .filter(Boolean)
        .join("\n");
      return data as T;
    }

    const head = `${strong(institution)}, ${degreeWithArea(degree, area)}${
      location ? ` -- ${location}` : ""
    }`;
    data.date_and_location_column = date;
    data.degree_column = [degree, area].filter(Boolean).join(" ");
    data.main_column = [head, highlights].filter(Boolean).join("\n");
    return data as T;
  }

  if (data.position || data.company) {
    const position = asText(data.position);
    const company = asText(data.company);
    const location = asText(data.location);
    const summary = processSummary(asText(data.summary));
    const highlights = processHighlights(data.highlights);

    if (options?.theme === "sb2nov") {
      data.date_and_location_column = [location, date]
        .filter(Boolean)
        .map((part) => emph(part))
        .join("\n");
      data.main_column = [strong(position), emph(company), summary, highlights]
        .filter(Boolean)
        .join("\n");
      return data as T;
    }

    const head = `${strong(position)}, ${company}${location ? ` -- ${location}` : ""}`;
    data.date_and_location_column = date;
    data.main_column = [head, highlights].filter(Boolean).join("\n");
    return data as T;
  }

  if (Array.isArray(data.authors) || data.doi || data.journal) {
    const authors = processAuthors(data.authors);
    const doi = asText(data.doi);
    const journal = asText(data.journal);
    data.date_and_location_column = date;
    data.publication_authors = authors;
    const publicationUrl = doi
      ? `[${doi.replaceAll("/", "\\/")}](https://doi.org/${doi})`
      : "";
    data.publication_url = publicationUrl;
    data.main_column = [
      strong(asText(data.title)),
      [authors, publicationUrl ? `${publicationUrl} (${journal})` : journal]
        .filter(Boolean)
        .join("\n"),
    ]
      .filter(Boolean)
      .join("\n");
    return data as T;
  }

  if (data.label && data.details) {
    data.main_column = `${strong(`${asText(data.label)}:`)} ${asText(data.details)}`;
    return data as T;
  }

  if (data.name || data.summary || data.highlights) {
    const summary = processSummary(asText(data.summary));
    const highlights = processHighlights(data.highlights);
    data.main_column = [strongOrLinked(asText(data.name)), summary, highlights]
      .filter(Boolean)
      .join("\n");
    data.date_and_location_column =
      options?.theme === "sb2nov" && date ? emph(date) : date;
    return data as T;
  }

  return data as T;
}

export function processFields(
  entry: unknown,
  stringProcessors: StringProcessor[],
): unknown {
  const skipped = new Set(["start_date", "end_date", "doi", "url"]);
  if (typeof entry === "string")
    return applyStringProcessors(entry, stringProcessors);
  if (!entry || typeof entry !== "object") return entry;

  const clone = { ...(entry as Record<string, unknown>) };
  for (const [field, value] of Object.entries(clone)) {
    if (field.startsWith("_") || skipped.has(field)) continue;
    if (typeof value === "string") {
      clone[field] = applyStringProcessors(value, stringProcessors);
      continue;
    }
    if (Array.isArray(value)) {
      clone[field] = value.map((item) =>
        typeof item === "string"
          ? applyStringProcessors(item, stringProcessors)
          : typeof item === "number" ||
              typeof item === "boolean" ||
              typeof item === "bigint"
            ? String(item)
            : "",
      );
      continue;
    }
    if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "bigint"
    ) {
      clone[field] = applyStringProcessors(String(value), stringProcessors);
    }
  }
  return clone;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function strong(text: string): string {
  return text ? `#strong[${text}]` : "";
}

function emph(text: string): string {
  return text ? `#emph[${text}]` : "";
}

function degreeWithArea(degree: string, area: string): string {
  if (degree && area) return `${degree} in ${area}`;
  return [degree, area].filter(Boolean).join(" ");
}

function processHighlights(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => (typeof item === "string" ? item : ""))
    .filter(Boolean)
    .map(
      (item) =>
        `- ${item.replaceAll(" - ", "\n- ").replace(/(\d)\/(\d)/g, "$1\\/$2")}`,
    )
    .join("\n");
}

function processAuthors(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => (typeof item === "string" ? item : ""))
    .filter(Boolean)
    .join(", ");
}

function processSummary(summary: string): string {
  if (!summary) return "";
  return `#summary[${summary}]`;
}

function processDate({
  date,
  startDate,
  endDate,
}: {
  date: unknown;
  startDate: unknown;
  endDate: unknown;
}): string {
  if (typeof date === "string" && date) return formatSingleDate(date);
  if (
    (typeof startDate === "string" || typeof startDate === "number") &&
    (typeof endDate === "string" || typeof endDate === "number")
  ) {
    return `${formatSingleDate(startDate)} – ${formatSingleDate(endDate)}`;
  }
  return "";
}

function formatSingleDate(value: string | number): string {
  if (typeof value === "number") return String(value);
  if (value === "present") return "present";
  if (/^\d{4}$/.test(value)) return `Jan ${value}`;
  const match = /^(\d{4})-(\d{2})/.exec(value);
  if (!match) return value;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[Number(match[2]) - 1]} ${match[1]}`;
}

function strongOrLinked(text: string): string {
  const match = /^\[(.+?)\]\((.+?)\)$/.exec(text);
  if (match) return `#strong[#link("${match[2]}")[${match[1]}]]`;
  return strong(text);
}
