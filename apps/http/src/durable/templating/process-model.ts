import moment from "moment";

import { computeConnections } from "./compute-connections";
import { getPreambleContextForTheme } from "./defaults/theme-defaults";
import { inferEntryType } from "./infer-entry-type";
import {
  applyStringProcessors,
  buildDatePlaceholders,
  makeKeywordsBold,
  markdownToTypst,
  processFields,
  renderEntryTemplates,
  renderFooterTemplate,
  renderTopNoteTemplate,
  substitutePlaceholders,
} from "./model-processor-helpers";
import type {
  RenderCvDocumentPayload,
  RenderCvJinjaRootContext,
} from "./types";

type RenderFileType = "typst" | "markdown";

function resolvePdfTitleTemplate(
  pdfTitle: unknown,
  plainName: unknown,
): unknown {
  if (typeof pdfTitle !== "string" || typeof plainName !== "string")
    return pdfTitle;
  if (!plainName) return pdfTitle;
  return pdfTitle.replaceAll("NAME", plainName);
}

export function processModel(
  payload: RenderCvDocumentPayload,
  fileType: RenderFileType,
): RenderCvJinjaRootContext {
  const model = structuredClone(payload);
  const { design } = payload;
  const preambleContext = getPreambleContextForTheme(design?.theme);
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
        ...(preambleContext.design.entries ?? {}),
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
    ...(fileType === "typst" ? [markdownToTypst] : []),
  ];

  data.cv._plain_name =
    (data.cv.name as string | undefined) ?? data.cv._plain_name;
  data.cv.name = applyStringProcessors(
    data.cv.name as string | null | undefined,
    stringProcessors,
  );
  data.cv.headline = applyStringProcessors(
    data.cv.headline as string | null | undefined,
    stringProcessors,
  );

  data.cv._connections = computeConnections(
    {
      cv: {
        ...((data.cv ?? {}) as RenderCvDocumentPayload["cv"]),
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
  const resolvedCurrentDate = data.settings._resolved_current_date as
    | { year: number; month: number; day: number }
    | undefined;
  const currentDate = resolvedCurrentDate ?? {
    year: now.year(),
    month: now.month() + 1,
    day: now.date(),
  };

  const localeRecord = data.locale as {
    last_updated?: string;
    month_abbreviations?: string[];
    month_names?: string[];
  };
  const designRecord = data.design as {
    theme?: string;
    templates?: unknown;
  };
  const templates = (designRecord.templates ?? {}) as {
    top_note?: string;
    footer?: string;
    single_date?: string;
    education_entry?: {
      main_column?: string;
      degree_column?: boolean;
    };
  };
  const singleDateTemplate = templates.single_date ?? "MONTH_ABBREVIATION YEAR";

  const pdfTitlePlaceholders = {
    CURRENT_DATE: substitutePlaceholders(
      singleDateTemplate,
      buildDatePlaceholders(currentDate, localeRecord),
    ),
    NAME: plainName,
    ...buildDatePlaceholders(currentDate, localeRecord),
  };
  const resolvedPdfTitle = resolvePdfTitleTemplate(
    data.settings.pdf_title,
    plainName,
  );
  if (typeof resolvedPdfTitle === "string") {
    data.settings.pdf_title = substitutePlaceholders(
      resolvedPdfTitle,
      pdfTitlePlaceholders,
    );
  } else {
    data.settings.pdf_title = resolvedPdfTitle;
  }
  if (!data.settings.pdf_title && typeof plainName === "string" && plainName)
    data.settings.pdf_title = `${plainName} - CV`;

  if (!data.settings._resolved_current_date) {
    data.settings._resolved_current_date = {
      year: now.year(),
      month: now.month() + 1,
      day: now.date(),
    };
  }

  const designPage = (
    data.design as {
      page?: { show_footer?: boolean; show_top_note?: boolean };
    }
  ).page;

  const showFooterFlag = (
    design as { ["show-page-footer"]?: boolean } | undefined
  )?.["show-page-footer"];
  const showFooter =
    typeof showFooterFlag === "boolean"
      ? showFooterFlag
      : Boolean(designPage?.show_footer);
  data.cv._footer = showFooter
    ? `context { [#emph[${data.cv._plain_name} -- #str(here().page())\\/#str(counter(page).final().first())]] }`
    : true;

  const showTopNoteFlag = (
    design as { ["show-page-top-note"]?: boolean } | undefined
  )?.["show-page-top-note"];
  const showTopNote =
    typeof showTopNoteFlag === "boolean"
      ? showTopNoteFlag
      : Boolean(designPage?.show_top_note);
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
  data.cv.rendercv_sections = Object.entries(sectionMap).map(
    ([title, values]) => {
      const rawEntries = Array.isArray(values) ? values : [values];
      const snake = title.trim().replace(/\s+/g, "_").toLowerCase();
      const prettyTitle =
        title.includes("_") || /^[a-z\s]+$/.test(title)
          ? title
              .split("_")
              .join(" ")
              .split(" ")
              .map((part) =>
                part ? part.charAt(0).toUpperCase() + part.slice(1) : part,
              )
              .join(" ")
          : title;
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
          }),
          stringProcessors,
        ),
      );
      return {
        title: applyStringProcessors(prettyTitle, stringProcessors),
        snake_case_title: snake,
        entry_type: inferEntryType(rawEntries),
        entries: processedEntries,
      };
    },
  );

  return data;
}
