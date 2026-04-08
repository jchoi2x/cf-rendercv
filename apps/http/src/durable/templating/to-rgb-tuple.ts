export function toRgbTuple(color: unknown): string {
  if (Array.isArray(color) && color.length === 3) {
    return `(${Number(color[0])}, ${Number(color[1])}, ${Number(color[2])})`;
  }
  if (typeof color === "string") {
    const hex = color.trim();
    const match = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (match) {
      const raw = match[1];
      const r = Number.parseInt(raw.slice(0, 2), 16);
      const g = Number.parseInt(raw.slice(2, 4), 16);
      const b = Number.parseInt(raw.slice(4, 6), 16);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return "rgb(0, 0, 0)";
}
