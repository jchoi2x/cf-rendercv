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

/** Bundled `.j2.typ` source strings keyed by the historical import names. */
export const TEMPLATE_FILE_CONTENTS = {
  BULLET_ENTRY_TEMPLATE,
  EDUCATION_ENTRY_TEMPLATE,
  EXPERIENCE_ENTRY_TEMPLATE,
  NORMAL_ENTRY_TEMPLATE,
  NUMBERED_ENTRY_TEMPLATE,
  ONE_LINE_ENTRY_TEMPLATE,
  PUBLICATION_ENTRY_TEMPLATE,
  REVERSED_NUMBERED_ENTRY_TEMPLATE,
  TEXT_ENTRY_TEMPLATE,
  HEADER_TEMPLATE,
  PREAMBLE_TEMPLATE,
  SECTION_BEGIN_TEMPLATE,
  SECTION_END_TEMPLATE,
} as const;

export const TEMPLATE_SOURCES = {
  preamble: TEMPLATE_FILE_CONTENTS.PREAMBLE_TEMPLATE,
  header: TEMPLATE_FILE_CONTENTS.HEADER_TEMPLATE,
  sectionBegin: TEMPLATE_FILE_CONTENTS.SECTION_BEGIN_TEMPLATE,
  sectionEnd: TEMPLATE_FILE_CONTENTS.SECTION_END_TEMPLATE,
  bulletEntry: TEMPLATE_FILE_CONTENTS.BULLET_ENTRY_TEMPLATE,
  educationEntry: TEMPLATE_FILE_CONTENTS.EDUCATION_ENTRY_TEMPLATE,
  experienceEntry: TEMPLATE_FILE_CONTENTS.EXPERIENCE_ENTRY_TEMPLATE,
  normalEntry: TEMPLATE_FILE_CONTENTS.NORMAL_ENTRY_TEMPLATE,
  numberedEntry: TEMPLATE_FILE_CONTENTS.NUMBERED_ENTRY_TEMPLATE,
  oneLineEntry: TEMPLATE_FILE_CONTENTS.ONE_LINE_ENTRY_TEMPLATE,
  publicationEntry: TEMPLATE_FILE_CONTENTS.PUBLICATION_ENTRY_TEMPLATE,
  reversedNumberedEntry: TEMPLATE_FILE_CONTENTS.REVERSED_NUMBERED_ENTRY_TEMPLATE,
  textEntry: TEMPLATE_FILE_CONTENTS.TEXT_ENTRY_TEMPLATE,
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
