/** Words that stay lowercase in section titles (RenderCV `dictionary_key_to_proper_section_title`). */
const WORDS_NOT_CAPITALIZED_IN_TITLE = new Set([
  "a",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "from",
  "if",
  "in",
  "into",
  "like",
  "near",
  "nor",
  "of",
  "off",
  "on",
  "onto",
  "or",
  "over",
  "so",
  "than",
  "that",
  "to",
  "upon",
  "when",
  "with",
  "yet",
]);

/**
 * Mirrors Python `dictionary_key_to_proper_section_title` for section dict keys.
 */
export function dictionaryKeyToProperSectionTitle(key: string): string {
  if (key.includes(" ") || [...key].some((c) => c >= "A" && c <= "Z")) {
    return key;
  }
  const title = key.replace(/_/g, " ");
  const words = title.split(" ");
  return words
    .map((word) => {
      const lower = word.toLowerCase();
      if (WORDS_NOT_CAPITALIZED_IN_TITLE.has(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/** Matches Python `BaseRenderCVSection.snake_case_title` for `show_time_spans_in` lookup. */
export function sectionSnakeCaseTitle(sectionDictKey: string): string {
  const title = dictionaryKeyToProperSectionTitle(sectionDictKey);
  return title.toLowerCase().replace(/\s+/g, "_");
}
