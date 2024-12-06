/**
 *
 * @param searchString
 * @returns A search string to better search with fullTextSearch
 */
export const transformSearch = (searchString?: string) => {
  if (!searchString) return null;
  const words = searchString
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const transformedWords = words.map((word) => `${word} | ${word}:*`);

  return transformedWords.join(" | ");
};
