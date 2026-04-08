import { preambleContext as classicPreambleContext } from "./classic";
import { preambleContext as engineeringclassicPreambleContext } from "./engineeringclassic";
import { preambleContext as engineeringresumesPreambleContext } from "./engineeringresumes";
import { preambleContext as moderncvPreambleContext } from "./moderncv";
import { preambleContext as sb2novPreambleContext } from "./sb2nov";

export const preambleContextByTheme = {
  classic: classicPreambleContext,
  engineeringclassic: engineeringclassicPreambleContext,
  engineeringresumes: engineeringresumesPreambleContext,
  moderncv: moderncvPreambleContext,
  sb2nov: sb2novPreambleContext,
} as const;

export type RenderCvTheme = keyof typeof preambleContextByTheme;

export function getPreambleContextForTheme(theme: unknown) {
  if (typeof theme === "string") {
    const ctx = preambleContextByTheme[theme as RenderCvTheme];
    if (ctx) return ctx;
  }
  return sb2novPreambleContext;
}
