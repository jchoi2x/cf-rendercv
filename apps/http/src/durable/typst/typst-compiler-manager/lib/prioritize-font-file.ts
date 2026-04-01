export function prioritizeFontFile(name: string): number {
  const n = name.toLowerCase();
  if (n.includes('regular') || n.includes('-400') || n.includes('roman')) {
    return 0;
  }
  if (n.includes('variable')) {
    return 1;
  }
  if (n.includes('book')) {
    return 2;
  }
  if (n.includes('bold') || n.includes('semibold')) {
    return 3;
  }
  if (n.includes('italic') || n.includes('oblique')) {
    return 4;
  }
  return 10;
}
