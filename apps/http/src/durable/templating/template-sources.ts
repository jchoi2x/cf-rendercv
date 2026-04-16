import BULLET_ENTRY_TEMPLATE from "./templates/typst/entries/BulletEntry.j2.typ";
import EDUCATION_ENTRY_TEMPLATE from "./templates/typst/entries/EducationEntry.j2.typ";
import EXPERIENCE_ENTRY_TEMPLATE from "./templates/typst/entries/ExperienceEntry.j2.typ";
import NORMAL_ENTRY_TEMPLATE from "./templates/typst/entries/NormalEntry.j2.typ";
import NUMBERED_ENTRY_TEMPLATE from "./templates/typst/entries/NumberedEntry.j2.typ";
import ONE_LINE_ENTRY_TEMPLATE from "./templates/typst/entries/OneLineEntry.j2.typ";
import PUBLICATION_ENTRY_TEMPLATE from "./templates/typst/entries/PublicationEntry.j2.typ";
import REVERSED_NUMBERED_ENTRY_TEMPLATE from "./templates/typst/entries/ReversedNumberedEntry.j2.typ";
import TEXT_ENTRY_TEMPLATE from "./templates/typst/entries/TextEntry.j2.typ";
import HEADER_TEMPLATE from "./templates/typst/Header.j2.typ";
import PREAMBLE_TEMPLATE from "./templates/typst/Preamble.j2.typ";
import SECTION_BEGIN_TEMPLATE from "./templates/typst/SectionBeginning.j2.typ";
import SECTION_END_TEMPLATE from "./templates/typst/SectionEnding.j2.typ";
import type { EntryTemplateMap } from "./types";

export const TEMPLATE_SOURCES = {
  preamble: PREAMBLE_TEMPLATE,
  header: HEADER_TEMPLATE,
  sectionBegin: SECTION_BEGIN_TEMPLATE,
  sectionEnd: SECTION_END_TEMPLATE,
  bulletEntry: BULLET_ENTRY_TEMPLATE,
  educationEntry: EDUCATION_ENTRY_TEMPLATE,
  experienceEntry: EXPERIENCE_ENTRY_TEMPLATE,
  normalEntry: NORMAL_ENTRY_TEMPLATE,
  numberedEntry: NUMBERED_ENTRY_TEMPLATE,
  oneLineEntry: ONE_LINE_ENTRY_TEMPLATE,
  publicationEntry: PUBLICATION_ENTRY_TEMPLATE,
  reversedNumberedEntry: REVERSED_NUMBERED_ENTRY_TEMPLATE,
  textEntry: TEXT_ENTRY_TEMPLATE,
} as const;

export const ENTRY_TEMPLATE_MAP: EntryTemplateMap = {
  BulletEntry: "bulletEntry",
  EducationEntry: "educationEntry",
  ExperienceEntry: "experienceEntry",
  NormalEntry: "normalEntry",
  NumberedEntry: "numberedEntry",
  OneLineEntry: "oneLineEntry",
  PublicationEntry: "publicationEntry",
  ReversedNumberedEntry: "reversedNumberedEntry",
  TextEntry: "textEntry",
};
