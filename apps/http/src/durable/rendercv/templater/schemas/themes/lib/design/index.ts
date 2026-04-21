import { z } from "@hono/zod-openapi";
import { getColors, type Colors } from "./colors";
import { getTypography, type Typography } from "./typography";
import { getPage, type Page } from "./page";
import { getLinks, type Links } from "./links";
import { getHeader, type Header } from "./headers";
import {
  getSectionTitles,
  type SectionTitles,
} from "./section_titles";
import { getSections, type Sections } from "./sections";
import { getEntries, type Entries } from "./entries";
import { getTemplates, type Templates } from "./templates";
import { BUILT_IN_THEME_OVERRIDES, type TThemeName } from "./defaults";

export interface Design {
  theme: TThemeName;
  page: Page;
  colors: Colors;
  typography: Typography;
  links: Links;
  header: Header;
  section_titles: SectionTitles;
  sections: Sections;
  entries: Entries;
  templates: Templates;
}

export const getDesignSchema = (themeName: TThemeName) => {
  const defaults = BUILT_IN_THEME_OVERRIDES[themeName] || BUILT_IN_THEME_OVERRIDES.classic;

  return z
    .object({
      theme: z.literal(defaults.theme || 'classic').default(defaults.theme || "classic").optional(),
      page: getPage(defaults.page as Page).optional(),
      colors: getColors(defaults.colors as Colors).optional(),
      typography: getTypography(defaults.typography as Typography).optional(),
      links: getLinks(defaults.links as Links).optional(),
      header: getHeader(defaults.header as Header).optional(),
      section_titles: getSectionTitles(defaults.section_titles as SectionTitles).optional(),
      sections: getSections(defaults.sections as Sections).optional(),
      entries: getEntries(defaults.entries as Entries).optional(),
      templates: getTemplates(defaults.templates as Templates).optional(),
    })
    .passthrough()
}


export type TDesign= z.infer<ReturnType<typeof getDesignSchema>>;