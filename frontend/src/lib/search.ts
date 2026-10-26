/**
 * Normalise un texte pour la recherche : minuscules, sans accents ni espaces
 * superflus. "Extrême-Nord" → "extreme-nord", "  Yaoundé " → "yaounde".
 */
export const normalizeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** Vrai si `text` contient `query`, sans tenir compte de la casse ni des accents. */
export const matchesQuery = (text: string, query: string): boolean => {
  const q = normalizeText(query);
  return !q || normalizeText(text).includes(q);
};
