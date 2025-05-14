export const getDescriptiveCourtName = (courtName?: string): string => {
  if (!courtName) return "";
  const lc = courtName.toLowerCase();
  return lc.endsWith("court") || lc.startsWith("corte") ? courtName : `${courtName} Court`;
};
