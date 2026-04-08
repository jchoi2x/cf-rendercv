export const normalizeFamilyName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
};

export const getFontFamilyMapping = (name: string, urls: string[] = []) => {
  const normalized = normalizeFamilyName(name);
  const filtered = urls.filter((url) => url.trim().length > 0);
  return {
    normalized,
    filtered,
  };
};
