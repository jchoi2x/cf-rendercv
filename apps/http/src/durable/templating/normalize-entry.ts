import type { NormalizedEntry } from "./types";

export function normalizeEntry(entry: unknown): unknown {
  if (typeof entry === "string") {
    return entry;
  }

  const raw = (entry ?? {}) as NormalizedEntry;
  const date = String(raw.date ?? "").trim() || "";
  const location = String(raw.location ?? "").trim() || "";
  const dateAndLocation = [date, location].filter(Boolean).join(" | ");
  const mainColumn = [
    raw.position ??
      raw.company ??
      raw.institution ??
      raw.name ??
      raw.title ??
      "",
    raw.company ?? "",
  ]
    .map((v: unknown) => String(v).trim())
    .filter(Boolean)
    .join("\n");
  return {
    ...raw,
    main_column: String(raw.main_column ?? mainColumn),
    main_column_lines: String(raw.main_column ?? mainColumn).split("\n"),
    date_and_location_column: String(
      raw.date_and_location_column ?? dateAndLocation,
    ),
    date_and_location_column_lines: String(
      raw.date_and_location_column ?? dateAndLocation,
    ).split("\n"),
    degree_column: String(
      raw.degree_column ?? [raw.degree, raw.area].filter(Boolean).join(" "),
    ),
    bullet: String(raw.bullet ?? raw.text ?? raw.summary ?? ""),
    number: String(raw.number ?? raw.rank ?? ""),
    reversed_number: String(raw.reversed_number ?? raw.rank ?? ""),
  };
}
