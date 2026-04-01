
export async function fetchFontBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Font fetch failed (${res.status}): ${url}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}
