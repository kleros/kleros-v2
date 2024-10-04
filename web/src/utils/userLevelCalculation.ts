export const levelTitles = [
  { level: 0, title: "Diogenes" },
  { level: 1, title: "Pythagoras" },
  { level: 2, title: "Socrates" },
  { level: 3, title: "Plato" },
  { level: 4, title: "Aristotle" },
];

export const getUserLevelData = (coherencyScore: number, totalResolvedDisputes: number) => {
  if (totalResolvedDisputes >= 3 && coherencyScore < 50) {
    return levelTitles.find(({ level }) => level === 0);
  }

  if (totalResolvedDisputes === 0 || (totalResolvedDisputes >= 1 && coherencyScore >= 0 && coherencyScore <= 70)) {
    return levelTitles.find(({ level }) => level === 1);
  }

  if (totalResolvedDisputes >= 3 && coherencyScore > 70 && coherencyScore <= 80) {
    return levelTitles.find(({ level }) => level === 2);
  }

  if (totalResolvedDisputes >= 7 && coherencyScore > 80 && coherencyScore <= 90) {
    return levelTitles.find(({ level }) => level === 3);
  }

  if (totalResolvedDisputes >= 10 && coherencyScore > 90) {
    return levelTitles.find(({ level }) => level === 4);
  }

  return levelTitles.find(({ level }) => level === 1);
};
