import { z } from "@hono/zod-openapi";
import { getFontFamily, type FontFamily } from "./font_family";
import { getFontSize, type FontSize } from "./font_size";
import { getSmallCapsAndBold, type SmallCaps } from "./small_caps";
import { getBold, type TBold } from "./bold";

export interface Typography {
  line_spacing?: string;
  alignment?: "left" | "justified" | "justified-with-no-hyphenation";
  date_and_location_column_alignment?: "left" | "center" | "right";
  font_family?: FontFamily;
  font_size?: FontSize;
  small_caps?: SmallCaps;
  bold?: TBold;
}

export const getTypography = (defaults: Typography) => {
  return z.object({
    line_spacing: z.string()
      .default(defaults.line_spacing ?? '0.6em')
      .describe("Space between lines of text. Larger values create more vertical space. The default value is `0.6em`."),
    alignment: z.enum(["left", "justified", "justified-with-no-hyphenation"] as const)
      .default(defaults.alignment ?? 'justified')
      .describe("Text alignment. Options: 'left', 'justified' (spreads text across full width), 'justified-with-no-hyphenation' (justified without word breaks). The default value is `justified`."),
    date_and_location_column_alignment: z.enum(["left", "center", "right"] as const)
      .default(defaults.date_and_location_column_alignment ?? 'right')
      .describe("Alignment for dates and locations in entries. Options: 'left', 'center', 'right'. The default value is `right`."),
    font_family: getFontFamily(defaults.font_family as FontFamily),
    font_size: getFontSize(defaults.font_size as FontSize),
    small_caps: getSmallCapsAndBold(defaults.small_caps as SmallCaps),
    bold: getBold(defaults.bold as TBold),
  });
}   

