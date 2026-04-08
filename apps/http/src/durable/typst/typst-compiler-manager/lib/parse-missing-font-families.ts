export function parseMissingFontFamilies(
  diagnostics: unknown[] | undefined,
): string[] {
  if (!diagnostics) {
    return [];
  }

  const out = new Set<string>();
  const pattern = /unknown font family:\s*(.+)$/i;

  for (const diagnostic of diagnostics as Array<{ message?: string }>) {
    const message = diagnostic?.message;
    if (!message) {
      continue;
    }
    const match = pattern.exec(message);
    if (!match?.[1]) {
      continue;
    }
    const family = match[1].trim().replace(/^['"]|['"]$/g, "");
    if (family) {
      out.add(family);
    }
  }

  return [...out.values()];
}
