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
  present?: string;
  year?: string;
  years?: string;
  month?: string;
  months?: string;
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
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "g");
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

export function escapeNonUrlForwardSlashes(value: string): string {
  let result = "";
  let index = 0;
  while (index < value.length) {
    if (value.startsWith("https://", index) || value.startsWith("http://", index)) {
      let end = index;
      while (
        end < value.length &&
        value[end] !== '"' &&
        value[end] !== "'" &&
        value[end] !== ")" &&
        value[end] !== "]" &&
        value[end] !== " " &&
        value[end] !== "\n" &&
        value[end] !== "\t"
      ) {
        end += 1;
      }
      result += value.slice(index, end);
      index = end;
      continue;
    }

    if (value[index] === "/" && value[index - 1] !== "\\") {
      result += "\\/";
      index += 1;
      continue;
    }

    result += value[index];
    index += 1;
  }
  return result;
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

function dateObjectToString(
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
  const normalizedTemplate = footerTemplate.replace(
    "PAGE_NUMBER/TOTAL_PAGES",
    "PAGE_NUMBER\\/TOTAL_PAGES",
  );
  const resolved = substitutePlaceholders(normalizedTemplate, placeholders);
  const processed =
    (applyStringProcessors(resolved, stringProcessors) as string) ?? "";
  return `context { [${processed}] }`;
}

/** Python omits empty-string placeholders from `entry_fields`. */
function pruneEmptyUppercaseFields(entry: Record<string, unknown>): void {
  for (const key of Object.keys(entry)) {
    if (/^[A-Z0-9_]+$/.test(key) && entry[key] === "") {
      delete entry[key];
    }
  }
}

export function renderEntryTemplates<T>(
  entry: T,
  options?: {
    theme?: string;
    degreeWithAreaTemplate?: string;
    educationStyle?: "default" | "separate-degree-line";
    educationDegreeColumnTemplate?: string | boolean;
    educationMainColumnTemplate?: string;
    educationDateAndLocationColumnTemplate?: string;
    experienceMainColumnTemplate?: string;
    experienceDateAndLocationColumnTemplate?: string;
    normalMainColumnTemplate?: string;
    normalDateAndLocationColumnTemplate?: string;
    oneLineMainColumnTemplate?: string;
    publicationMainColumnTemplate?: string;
    publicationDateAndLocationColumnTemplate?: string;
    showTimeSpan?: boolean;
    currentDate?: DateLike;
    locale?: LocaleLike;
    singleDateTemplate?: string;
    dateRangeTemplate?: string;
    timeSpanTemplate?: string;
  },
): T {
  if (!entry || typeof entry !== "object") return entry;
  const data = { ...(entry as Record<string, unknown>) };
  const done = (): T => {
    pruneEmptyUppercaseFields(data);
    return data as T;
  };

  const locale = options?.locale ?? {};
  const singleDateTemplate =
    options?.singleDateTemplate ?? "MONTH_ABBREVIATION YEAR";
  const dateRangeTemplate =
    options?.dateRangeTemplate ?? "START_DATE – END_DATE";
  const timeSpanTemplate =
    options?.timeSpanTemplate ??
    "HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS";

  const fmtOne = (value: unknown) =>
    formatSingleDateUnknown(value, locale, singleDateTemplate);

  const date = processDate({
    date: data.date,
    startDate: data.start_date,
    endDate: data.end_date,
    locale,
    currentDate: options?.currentDate,
    showTimeSpan: options?.showTimeSpan,
    singleDateTemplate,
    dateRangeTemplate,
    timeSpanTemplate,
  });

  if (data.institution || data.degree || data.area) {
    const degree = asText(data.degree);
    const area = asText(data.area);
    const institution = asText(data.institution);
    const location = asText(data.location);
    const summary = processSummary(asText(data.summary));
    const highlights = processHighlights(data.highlights);
    const degreeWithAreaText = resolveDegreeWithAreaText(
      degree,
      area,
      options?.degreeWithAreaTemplate,
    );
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
      data.INSTITUTION = institution;
      data.AREA = area;
      data.DEGREE = degree;
      data.LOCATION = location;
      if (summary) data.SUMMARY = summary;
      data.HIGHLIGHTS = highlights;
      data.START_DATE = fmtOne(data.start_date);
      data.END_DATE = fmtOne(data.end_date);
      data.DATE = date;
      return done();
    }

    const head = `${strong(institution)}, ${degreeWithArea(degree, area)}${
      location ? ` -- ${location}` : ""
    }`;
    data.date_and_location_column = resolveDateAndLocationColumnFromTemplate(
      options?.educationDateAndLocationColumnTemplate,
      { LOCATION: location, DATE: date },
      date,
    );
    const degreeColumn = resolveEducationDegreeColumn(
      degree,
      area,
      options?.educationDegreeColumnTemplate,
      typeof data.degree_column === "string" ? data.degree_column : undefined,
      degreeWithAreaText,
    );
    if (degreeColumn !== undefined) {
      data.degree_column = degreeColumn;
    }
    data.main_column = resolveMainColumnFromTemplate(
      options?.educationMainColumnTemplate,
      {
        INSTITUTION: institution,
        AREA: area,
        DEGREE: degree,
        DEGREE_WITH_AREA: degreeWithAreaText,
        LOCATION: location,
        SUMMARY: summary,
        HIGHLIGHTS: highlights,
      },
      [head, highlights].filter(Boolean).join("\n"),
    );
    data.INSTITUTION = institution;
    data.AREA = area;
    data.DEGREE = degree;
    data.LOCATION = location;
    if (summary) data.SUMMARY = summary;
    data.HIGHLIGHTS = highlights;
    data.START_DATE = fmtOne(data.start_date);
    data.END_DATE = fmtOne(data.end_date);
    data.DATE = date;
    return done();
  }

  if (data.position || data.company) {
    const position = asText(data.position);
    const company = asText(data.company);
    const location = asText(data.location);
    const summary = processSummary(asText(data.summary));
    const highlights = processHighlights(data.highlights);
    const dateWithTimeSpan = date;

    if (options?.theme === "sb2nov") {
      data.date_and_location_column = [location, date]
        .filter(Boolean)
        .map((part) => emph(part))
        .join("\n");
      data.main_column = [strong(position), emph(company), summary, highlights]
        .filter(Boolean)
        .join("\n");
      data.COMPANY = company;
      data.POSITION = position;
      data.LOCATION = location;
      if (summary) data.SUMMARY = summary;
      data.HIGHLIGHTS = highlights;
      data.START_DATE = fmtOne(data.start_date);
      data.END_DATE = fmtOne(data.end_date);
      data.DATE = dateWithTimeSpan;
      return done();
    }

    const head = [strong(company), position].filter(Boolean).join(", ");
    data.date_and_location_column = resolveDateAndLocationColumnFromTemplate(
      options?.experienceDateAndLocationColumnTemplate,
      { LOCATION: location, DATE: dateWithTimeSpan },
      [location, dateWithTimeSpan].filter(Boolean).join("\n"),
    );
    data.main_column = resolveMainColumnFromTemplate(
      options?.experienceMainColumnTemplate,
      {
        COMPANY: company,
        POSITION: position,
        LOCATION: location,
        SUMMARY: summary,
        HIGHLIGHTS: highlights,
      },
      [head, summary, highlights].filter(Boolean).join("\n"),
    );
    data.COMPANY = company;
    data.POSITION = position;
    data.LOCATION = location;
    if (summary) data.SUMMARY = summary;
    data.HIGHLIGHTS = highlights;
    data.START_DATE = fmtOne(data.start_date);
    data.END_DATE = fmtOne(data.end_date);
    data.DATE = dateWithTimeSpan;
    return done();
  }

  if (Array.isArray(data.authors) || data.doi || data.journal) {
    const authors = processAuthors(data.authors);
    const doi = asText(data.doi);
    const journal = asText(data.journal);
    data.date_and_location_column = resolveDateAndLocationColumnFromTemplate(
      options?.publicationDateAndLocationColumnTemplate,
      { DATE: date },
      date,
    );
    const publicationUrl = doi
      ? `[${doi.replaceAll("/", "\\/")}](https://doi.org/${doi})`
      : "";
    const publicationSummary = processSummary(asText(data.summary));
    data.main_column = resolveMainColumnFromTemplate(
      options?.publicationMainColumnTemplate,
      {
        TITLE: asText(data.title),
        SUMMARY: publicationSummary,
        AUTHORS: authors,
        URL: publicationUrl,
        JOURNAL: journal,
      },
      [
        strong(asText(data.title)),
        [authors, publicationUrl ? `${publicationUrl} (${journal})` : journal]
          .filter(Boolean)
          .join("\n"),
      ]
        .filter(Boolean)
        .join("\n"),
    );
    data.TITLE = asText(data.title);
    data.AUTHORS = authors;
    data.JOURNAL = journal;
    data.DATE = date;
    if (publicationUrl) {
      data.DOI = publicationUrl;
      data.URL = publicationUrl;
    } else if (asText(data.url)) {
      const u = asText(data.url);
      data.URL = `[${u.replaceAll("/", "\\/")}](${u})`;
    }
    return done();
  }

  if (data.label && data.details) {
    data.main_column = resolveMainColumnFromTemplate(
      options?.oneLineMainColumnTemplate,
      {
        LABEL: asText(data.label),
        DETAILS: asText(data.details),
      },
      `${strong(`${asText(data.label)}:`)} ${asText(data.details)}`,
    );
    data.LABEL = asText(data.label);
    data.DETAILS = asText(data.details);
    return done();
  }

  if (data.name || data.summary || data.highlights) {
    const summary = processSummary(asText(data.summary));
    const highlights = processHighlights(data.highlights);
    data.main_column = resolveMainColumnFromTemplate(
      options?.normalMainColumnTemplate,
      {
        NAME: asText(data.name),
        LOCATION: asText(data.location),
        SUMMARY: summary,
        HIGHLIGHTS: highlights,
      },
      [strongOrLinked(asText(data.name)), summary, highlights].filter(Boolean).join("\n"),
    );
    data.date_and_location_column =
      resolveDateAndLocationColumnFromTemplate(
        options?.normalDateAndLocationColumnTemplate,
        {
          LOCATION: asText(data.location),
          DATE: options?.theme === "sb2nov" && date ? emph(date) : date,
        },
        options?.theme === "sb2nov" && date ? emph(date) : date,
      );
    data.NAME = asText(data.name);
    data.LOCATION = asText(data.location);
    if (summary) data.SUMMARY = summary;
    data.HIGHLIGHTS = highlights;
    data.START_DATE = fmtOne(data.start_date);
    data.END_DATE = fmtOne(data.end_date);
    data.DATE = date;
    return done();
  }

  return done();
}

export function processFields(
  entry: unknown,
  stringProcessors: StringProcessor[],
): unknown {
  const skipped = new Set(["start_date", "end_date", "doi", "url"]);
  if (typeof entry === "string") return entry;
  if (!entry || typeof entry !== "object") return entry;

  const clone = { ...(entry as Record<string, unknown>) };
  for (const [field, value] of Object.entries(clone)) {
    if (/^[A-Z0-9_]+$/.test(field) && value == null) {
      delete clone[field];
      continue;
    }
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

function resolveEducationDegreeColumn(
  degree: string,
  area: string,
  template: string | boolean | undefined,
  existingValue: string | undefined,
  degreeWithArea: string,
): string | undefined {
  if (template === false) return "";
  if (typeof template === "string") {
    return substitutePlaceholders(template, {
      DEGREE: degree,
      AREA: area,
      DEGREE_WITH_AREA: degreeWithArea,
    });
  }
  if (existingValue !== undefined) return existingValue;
  return undefined;
}

function resolveMainColumnFromTemplate(
  template: string | undefined,
  placeholders: Record<string, string>,
  fallback: string,
): string {
  if (!template) return fallback;
  const substituted = substitutePlaceholders(template, placeholders);
  return substituted
    .split("\n")
    .map((line) =>
      line
        .replace(/\s--\s\*+\s*\*+\s*$/, "")
        .replace(/\s--\s*$/, "")
        .trimEnd(),
    )
    .filter((line) => line.trim() !== "")
    .join("\n");
}

function resolveDateAndLocationColumnFromTemplate(
  template: string | undefined,
  placeholders: Record<string, string>,
  fallback: string,
): string {
  if (!template) return fallback;
  return substitutePlaceholders(template, placeholders);
}

function resolveDegreeWithAreaText(
  degree: string,
  area: string,
  template: string | undefined,
): string {
  if (template) {
    return substitutePlaceholders(template, {
      DEGREE: degree,
      AREA: area,
    });
  }
  return degreeWithArea(degree, area);
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

/** Mirrors `rendercv` `get_date_object` (exact-date parsing). */
function getDateObject(
  date: string | number,
  currentDate?: DateLike,
): DateLike {
  if (typeof date === "number") {
    return { year: date, month: 1, day: 1 };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const segs = date.split("-");
    return {
      year: Number(segs[0]),
      month: Number(segs[1]),
      day: Number(segs[2]),
    };
  }
  if (/^\d{4}-\d{2}$/.test(date)) {
    const segs = date.split("-");
    return { year: Number(segs[0]), month: Number(segs[1]), day: 1 };
  }
  if (/^\d{4}$/.test(date)) {
    return { year: Number(date), month: 1, day: 1 };
  }
  if (date === "present") {
    if (!currentDate) {
      throw new Error("current_date is required when processing 'present' date");
    }
    return { ...currentDate };
  }
  throw new Error("invalid date");
}

function formatSingleDate(
  date: string | number,
  locale: LocaleLike,
  singleDateTemplate: string,
): string {
  if (typeof date === "number") return String(date);
  if (date === "present") return locale.present ?? "present";
  try {
    const dateObject = getDateObject(date);
    return dateObjectToString(dateObject, locale, singleDateTemplate);
  } catch {
    return date;
  }
}

function formatDateRange(
  startDate: string | number,
  endDate: string | number,
  locale: LocaleLike,
  singleDateTemplate: string,
  dateRangeTemplate: string,
): string {
  let start: string;
  if (typeof startDate === "number") {
    start = String(startDate);
  } else {
    const dateObject = getDateObject(startDate);
    start = dateObjectToString(dateObject, locale, singleDateTemplate);
  }

  let end: string;
  if (endDate === "present") {
    end = locale.present ?? "present";
  } else if (typeof endDate === "number") {
    end = String(endDate);
  } else {
    const dateObject = getDateObject(endDate);
    end = dateObjectToString(dateObject, locale, singleDateTemplate);
  }

  return substitutePlaceholders(dateRangeTemplate, {
    START_DATE: start,
    END_DATE: end,
  });
}

/** Mirrors `rendercv.renderer.templater.date.compute_time_span_string`. */
function computeTimeSpanString(
  startDate: string | number,
  endDate: string | number,
  locale: LocaleLike,
  currentDate: DateLike,
  timeSpanTemplate: string,
): string {
  if (typeof startDate === "number" || typeof endDate === "number") {
    const startYear = getDateObject(startDate, currentDate).year;
    const endYear = getDateObject(endDate, currentDate).year;
    const timeSpanInYears = endYear - startYear;
    let howManyYears: string;
    let localeYears: string;
    if (timeSpanInYears < 2) {
      howManyYears = "1";
      localeYears = locale.year ?? "year";
    } else {
      howManyYears = String(timeSpanInYears);
      localeYears = locale.years ?? "years";
    }
    return substitutePlaceholders(timeSpanTemplate, {
      HOW_MANY_YEARS: howManyYears,
      YEARS: localeYears,
      HOW_MANY_MONTHS: "",
      MONTHS: "",
    });
  }

  const endDateObject = getDateObject(endDate, currentDate);
  const startDateObject = getDateObject(startDate, currentDate);
  const startJs = new Date(
    startDateObject.year,
    startDateObject.month - 1,
    startDateObject.day,
  );
  const endJs = new Date(
    endDateObject.year,
    endDateObject.month - 1,
    endDateObject.day,
  );
  const timespanInDays = Math.round(
    (endJs.getTime() - startJs.getTime()) / 86_400_000,
  );

  let howManyYears = Math.floor(timespanInDays / 365);
  let howManyMonths = Math.floor((timespanInDays % 365) / 30) + 1;
  howManyYears += Math.floor(howManyMonths / 12);
  howManyMonths %= 12;

  let howManyYearsStr: string;
  let localeYearsStr: string;
  if (howManyYears === 0) {
    howManyYearsStr = "";
    localeYearsStr = "";
  } else if (howManyYears === 1) {
    howManyYearsStr = "1";
    localeYearsStr = locale.year ?? "year";
  } else {
    howManyYearsStr = String(howManyYears);
    localeYearsStr = locale.years ?? "years";
  }

  let howManyMonthsStr: string;
  let localeMonthsStr: string;
  if (howManyMonths === 0) {
    howManyMonthsStr = "";
    localeMonthsStr = "";
  } else if (howManyMonths === 1) {
    howManyMonthsStr = "1";
    localeMonthsStr = locale.month ?? "month";
  } else {
    howManyMonthsStr = String(howManyMonths);
    localeMonthsStr = locale.months ?? "months";
  }

  return substitutePlaceholders(timeSpanTemplate, {
    HOW_MANY_YEARS: howManyYearsStr,
    YEARS: localeYearsStr,
    HOW_MANY_MONTHS: howManyMonthsStr,
    MONTHS: localeMonthsStr,
  });
}

function processDate({
  date,
  startDate,
  endDate,
  locale,
  currentDate,
  showTimeSpan,
  singleDateTemplate,
  dateRangeTemplate,
  timeSpanTemplate,
}: {
  date: unknown;
  startDate: unknown;
  endDate: unknown;
  locale: LocaleLike;
  currentDate?: DateLike;
  showTimeSpan?: boolean;
  singleDateTemplate: string;
  dateRangeTemplate: string;
  timeSpanTemplate: string;
}): string {
  if (date && !(startDate || endDate)) {
    return formatSingleDate(date as string | number, locale, singleDateTemplate);
  }

  if (
    (typeof startDate === "string" ||
      typeof startDate === "number") &&
    (typeof endDate === "string" || typeof endDate === "number") &&
    startDate !== "" &&
    endDate !== ""
  ) {
    const dateRange = formatDateRange(
      startDate as string | number,
      endDate as string | number,
      locale,
      singleDateTemplate,
      dateRangeTemplate,
    );
    if (showTimeSpan && currentDate) {
      const timeSpan = computeTimeSpanString(
        startDate as string | number,
        endDate as string | number,
        locale,
        currentDate,
        timeSpanTemplate,
      );
      return `${dateRange}\n\n${timeSpan}`;
    }
    return dateRange;
  }

  return "";
}

function formatSingleDateUnknown(
  value: unknown,
  locale: LocaleLike,
  singleDateTemplate: string,
): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" || typeof value === "string") {
    return formatSingleDate(value, locale, singleDateTemplate);
  }
  return "";
}

function strongOrLinked(text: string): string {
  const match = /^\[(.+?)\]\((.+?)\)$/.exec(text);
  if (match) return `#strong[#link("${match[2]}")[${match[1]}]]`;
  return strong(text);
}
