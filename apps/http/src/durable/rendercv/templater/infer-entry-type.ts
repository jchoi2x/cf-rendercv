export function inferEntryType(entries: unknown[]): string {
  const first = entries[0];
  if (typeof first === "string") {
    return "TextEntry";
  }
  const obj = (first ?? {}) as Record<string, unknown>;
  if ("bullet" in obj) {
    return "BulletEntry";
  }
  if ("reversed_number" in obj) {
    return "ReversedNumberedEntry";
  }
  if ("number" in obj) {
    return "NumberedEntry";
  }
  if ("label" in obj && "details" in obj) {
    return "OneLineEntry";
  }
  if ("authors" in obj || "doi" in obj || "journal" in obj) {
    return "PublicationEntry";
  }
  if ("institution" in obj || "degree" in obj) {
    return "EducationEntry";
  }
  if ("position" in obj || "company" in obj) {
    return "ExperienceEntry";
  }
  return "NormalEntry";
}
