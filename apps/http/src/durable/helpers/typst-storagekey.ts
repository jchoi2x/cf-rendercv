const TYPST_FONT_STORAGE_PREFIX = "typst-font:";

export async function typstFontStorageKey(url: string): Promise<string> {
  const data = new TextEncoder().encode(url);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${TYPST_FONT_STORAGE_PREFIX}${hex}`;
}
