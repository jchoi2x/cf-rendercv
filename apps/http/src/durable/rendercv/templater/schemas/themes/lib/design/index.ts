import { z } from "@hono/zod-openapi";

import { getColors, type Colors } from "./colors";
import { BUILT_IN_THEME_OVERRIDES, type TThemeName } from "./defaults";
import { getEntries, type Entries } from "./entries";
import { getHeader, type Header } from "./headers";
import { getLinks, type Links } from "./links";
import { getPage, type Page } from "./page";
import { getSectionTitles, type SectionTitles } from "./section_titles";
import { getSections, type Sections } from "./sections";
import { getTemplates, type Templates } from "./templates";
import { getTypography, type Typography } from "./typography";

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
  const defaults =
    BUILT_IN_THEME_OVERRIDES[themeName] || BUILT_IN_THEME_OVERRIDES.classic;

  return z
    .object({
      theme: z
        .literal(defaults.theme || "classic")
        .default(defaults.theme || "classic")
        .optional(),
      page: getPage(defaults.page).optional(),
      colors: getColors(defaults.colors).optional(),
      typography: getTypography(defaults.typography).optional(),
      links: getLinks(defaults.links).optional(),
      header: getHeader(defaults.header).optional(),
      section_titles: getSectionTitles(defaults.section_titles).optional(),
      sections: getSections(defaults.sections).optional(),
      entries: getEntries(defaults.entries).optional(),
      templates: getTemplates(defaults.templates).optional(),
    })
    .passthrough();
};

export type TDesign = z.infer<ReturnType<typeof getDesignSchema>>;
