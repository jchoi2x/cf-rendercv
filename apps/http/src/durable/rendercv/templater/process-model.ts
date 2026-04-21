import moment from "moment";

import { computeConnections } from "./compute-connections";
import { getPreambleContextForTheme } from "./defaults/theme-defaults";
import { inferEntryType } from "./infer-entry-type";
import {
  captureCvKeyOrder,
  mergeAndParseRenderCvPayload,
} from "./merge-payload";
import {
  applyStringProcessors,
  buildDatePlaceholders,
  escapeNonUrlForwardSlashes,
  makeKeywordsBold,
  markdownToTypst,
  processFields,
  renderEntryTemplates,
  renderFooterTemplate,
  renderTopNoteTemplate,
  substitutePlaceholders,
} from "./model-processor-helpers";
import { type TThemeName } from "./schemas/themes/lib/design/defaults";
import {
  languages,
  type TLocaleName,
} from "./schemas/themes/lib/locale/defaults";
import {
  dictionaryKeyToProperSectionTitle,
  sectionSnakeCaseTitle,
} from "./section-title";
import {
  ThemeNames,
  type RenderCvDocumentPayload,
  type RenderCvJinjaRootContext,
} from "./types";

type RenderFileType = "typst" | "markdown";

function normalizeThemeName(theme: unknown): TThemeName {
  if (typeof theme === "string" && ThemeNames.includes(theme as TThemeName)) {
    return theme as TThemeName;
  }
  return "classic";
}

function normalizeLocaleName(language: unknown): TLocaleName {
  if (
    typeof language === "string" &&
    (languages as readonly string[]).includes(language)
  ) {
    return language as TLocaleName;
  }
  return "english";
}

function normalizeCurrentDate(
  value: unknown,
): { year: number; month: number; day: number } | undefined {
  if (
    value &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>).year === "number" &&
    typeof (value as Record<string, unknown>).month === "number" &&
    typeof (value as Record<string, unknown>).day === "number"
  ) {
    return value as { year: number; month: number; day: number };
  }

  if (typeof value === "string") {
    const parsed = moment(value, "YYYY-MM-DD", true);
    if (parsed.isValid()) {
      return {
        year: parsed.year(),
        month: parsed.month() + 1,
        day: parsed.date(),
      };
    }
  }

  return undefined;
}

export function processModel(
  payload: RenderCvDocumentPayload,
  fileType: RenderFileType,
): RenderCvJinjaRootContext {
  const themeName = normalizeThemeName(payload?.design?.theme);
  const localeName = normalizeLocaleName(payload?.locale?.language);
  const cvKeyOrder = captureCvKeyOrder(payload.cv);
  const model = mergeAndParseRenderCvPayload(payload, themeName, localeName);
  const { design } = model;
  const preambleContext = getPreambleContextForTheme(design?.theme, localeName);
  const now = moment();

  const data: RenderCvJinjaRootContext = {
    cv: {
      ...(preambleContext.cv ?? {}),
      ...(model.cv ?? {}),
    },
    design: {
      ...(preambleContext.design ?? {}),
      ...(design ?? {}),
      entries: {
        ...((
          preambleContext.design as
            | { entries?: Record<string, unknown> }
            | undefined
        )?.entries ?? {}),
        ...(design?.entries ?? {}),
      },
    },
    locale: {
      ...(preambleContext.locale ?? {}),
      ...(model.locale ?? {}),
    },
    settings: {
      ...(preambleContext.settings ?? {}),
      ...(model.settings ?? {}),
    },
  };

  const stringProcessors = [
    (value: string) =>
      makeKeywordsBold(
        value,
        ((data.settings.bold_keywords as string[] | undefined) ?? []).filter(
          (keyword) => typeof keyword === "string",
        ),
      ),
    ...(fileType === "typst"
      ? [markdownToTypst, escapeNonUrlForwardSlashes]
      : []),
  ];

  data.cv._key_order = cvKeyOrder.length
    ? cvKeyOrder
    : ((data.cv._key_order as string[] | undefined) ?? []);
  data.cv._plain_name =
    (data.cv.name as string | undefined) ?? data.cv._plain_name;
  data.cv.name = applyStringProcessors(data.cv.name, stringProcessors);
  data.cv.headline = applyStringProcessors(data.cv.headline, stringProcessors);

  data.cv._connections = computeConnections(
    {
      cv: {
        ...(data.cv ?? {}),
        _key_order: data.cv._key_order as string[] | undefined,
        social_networks:
          (data.cv.social_networks as
            | Array<{ network: string; username: string }>
            | undefined) ?? [],
      },
      design: (data.design ?? {}) as RenderCvDocumentPayload["design"],
    },
    fileType,
  );

  const plainName =
    typeof data.cv._plain_name === "string" ? data.cv._plain_name : "";
  const resolvedCurrentDate = normalizeCurrentDate(
    data.settings._resolved_current_date,
  );
  const currentDate = resolvedCurrentDate ?? {
    year: now.year(),
    month: now.month() + 1,
    day: now.date(),
  };

  const localeRecord = data.locale as {
    last_updated?: string;
    month_abbreviations?: string[];
    month_names?: string[];
    present?: string;
    year?: string;
    years?: string;
    month?: string;
    months?: string;
    phrases?: { degree_with_area?: string };
  };
  const designRecord = data.design as {
    theme?: string;
    templates?: unknown;
  };
  const templates = (designRecord.templates ?? {}) as {
    top_note?: string;
    footer?: string;
    single_date?: string;
    date_range?: string;
    time_span?: string;
    one_line_entry?: { main_column?: string };
    education_entry?: {
      main_column?: string;
      degree_column?: string | boolean;
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
  };
  const singleDateTemplate = templates.single_date ?? "MONTH_ABBREVIATION YEAR";
  const dateRangeTemplate = templates.date_range ?? "START_DATE – END_DATE";
  const timeSpanTemplate =
    templates.time_span ?? "HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS";

  const pdfTitlePlaceholders = {
    CURRENT_DATE: substitutePlaceholders(
      singleDateTemplate,
      buildDatePlaceholders(currentDate, localeRecord),
    ),
    NAME: plainName,
    ...buildDatePlaceholders(currentDate, localeRecord),
  };
  const pdfTitleRaw = data.settings.pdf_title;
  if (typeof pdfTitleRaw === "string") {
    data.settings.pdf_title = substitutePlaceholders(
      pdfTitleRaw,
      pdfTitlePlaceholders,
    );
  }
  if (!data.settings.pdf_title && typeof plainName === "string" && plainName)
    data.settings.pdf_title = `${plainName} - CV`;

  data.settings._resolved_current_date = `${String(currentDate.year).padStart(
    4,
    "0",
  )}-${String(currentDate.month).padStart(2, "0")}-${String(
    currentDate.day,
  ).padStart(2, "0")}`;

  const inputDesignFlags = payload.design as
    | {
        ["show-page-footer"]?: boolean;
        ["show-page-top-note"]?: boolean;
      }
    | undefined;
  const showFooter =
    typeof inputDesignFlags?.["show-page-footer"] === "boolean"
      ? inputDesignFlags["show-page-footer"]
      : true;
  const cvMutable = data.cv as Record<string, unknown>;
  if (showFooter) {
    data.cv._footer = `context { [#emph[${data.cv._plain_name} -- #str(here().page())\\/#str(counter(page).final().first())]] }`;
  } else {
    cvMutable._footer = true;
  }

  const showTopNote =
    typeof inputDesignFlags?.["show-page-top-note"] === "boolean"
      ? inputDesignFlags["show-page-top-note"]
      : true;
  const monthLabel = now.format("MMM");
  const yearLabel = now.format("YYYY");
  data.cv._top_note = showTopNote
    ? templates.top_note
      ? renderTopNoteTemplate({
          topNoteTemplate: templates.top_note,
          locale: localeRecord,
          currentDate,
          name: typeof data.cv.name === "string" ? data.cv.name : plainName,
          singleDateTemplate,
          stringProcessors,
        })
      : `#emph[Last updated in ${monthLabel} ${yearLabel}]`
    : "";
  if (showFooter) {
    data.cv._footer = templates.footer
      ? renderFooterTemplate({
          footerTemplate: templates.footer,
          locale: localeRecord,
          currentDate,
          name: typeof data.cv.name === "string" ? data.cv.name : plainName,
          singleDateTemplate,
          stringProcessors,
        })
      : `context { [#emph[${data.cv._plain_name} -- #str(here().page())\\/#str(counter(page).final().first())]] }`;
  }

  const sectionMap = (data.cv.sections ?? {}) as Record<string, unknown>;
  const showTimeSpansIn = (
    data.design as { sections?: { show_time_spans_in?: unknown } }
  ).sections?.show_time_spans_in;

  const normalizedSections: Record<string, unknown[]> = {};
  const rendercvSections: Array<{
    title: string;
    snake_case_title: string;
    entry_type: string;
    entries: unknown[];
  }> = [];

  for (const [sectionDictKey, values] of Object.entries(sectionMap)) {
    const rawEntries = Array.isArray(values) ? values : [values];
    const sectionSnake = sectionSnakeCaseTitle(sectionDictKey);
    const showTimeSpanForSection =
      Array.isArray(showTimeSpansIn) &&
      showTimeSpansIn.some((section) => section === sectionSnake);
    const processedEntries = rawEntries.map((entry) =>
      processFields(
        renderEntryTemplates(entry, {
          educationStyle:
            templates.education_entry?.degree_column === false &&
            typeof templates.education_entry?.main_column === "string" &&
            templates.education_entry.main_column.includes("DEGREE") &&
            templates.education_entry.main_column.includes("AREA")
              ? "separate-degree-line"
              : "default",
          theme:
            typeof designRecord.theme === "string"
              ? designRecord.theme
              : undefined,
          degreeWithAreaTemplate: localeRecord.phrases?.degree_with_area,
          educationDegreeColumnTemplate:
            templates.education_entry?.degree_column,
          educationMainColumnTemplate: templates.education_entry?.main_column,
          educationDateAndLocationColumnTemplate:
            templates.education_entry?.date_and_location_column,
          experienceMainColumnTemplate: templates.experience_entry?.main_column,
          experienceDateAndLocationColumnTemplate:
            templates.experience_entry?.date_and_location_column,
          normalMainColumnTemplate: templates.normal_entry?.main_column,
          normalDateAndLocationColumnTemplate:
            templates.normal_entry?.date_and_location_column,
          oneLineMainColumnTemplate: templates.one_line_entry?.main_column,
          publicationMainColumnTemplate:
            templates.publication_entry?.main_column,
          publicationDateAndLocationColumnTemplate:
            templates.publication_entry?.date_and_location_column,
          showTimeSpan: showTimeSpanForSection,
          currentDate,
          locale: localeRecord,
          singleDateTemplate,
          dateRangeTemplate,
          timeSpanTemplate,
        }),
        stringProcessors,
      ),
    );
    normalizedSections[sectionDictKey] = processedEntries;
    rendercvSections.push({
      title: dictionaryKeyToProperSectionTitle(sectionDictKey),
      snake_case_title: sectionSnakeCaseTitle(sectionDictKey),
      entry_type: inferEntryType(rawEntries),
      entries: processedEntries,
    });
  }
  data.cv.sections = normalizedSections;
  (data.cv as { rendercv_sections?: unknown }).rendercv_sections =
    rendercvSections;

  return data;
}
