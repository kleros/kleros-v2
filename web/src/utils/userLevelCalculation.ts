interface ILevelCriteria {
  level: number;
  title: string;
  minDisputes: number;
  minScore: number;
  maxScore: number;
}

const levelCriteria: ILevelCriteria[] = [
  { level: 0, title: "Diogenes", minDisputes: 3, minScore: 0, maxScore: 49 },
  { level: 1, title: "Pythagoras", minDisputes: 0, minScore: 0, maxScore: 70 },
  { level: 2, title: "Socrates", minDisputes: 3, minScore: 71, maxScore: 80 },
  { level: 3, title: "Plato", minDisputes: 7, minScore: 81, maxScore: 90 },
  { level: 4, title: "Aristotle", minDisputes: 10, minScore: 91, maxScore: 100 },
];

export const getUserLevelData = (coherenceScore: number, totalResolvedDisputes: number) => {
  for (const criteria of levelCriteria) {
    if (
      criteria.level > 0 &&
      totalResolvedDisputes >= criteria.minDisputes &&
      coherenceScore >= criteria.minScore &&
      coherenceScore <= criteria.maxScore
    ) {
      return criteria;
    }
  }

  if (
    totalResolvedDisputes >= levelCriteria[0].minDisputes &&
    coherenceScore >= levelCriteria[0].minScore &&
    coherenceScore <= levelCriteria[0].maxScore
  ) {
    return levelCriteria[0];
  }

  return levelCriteria.find(({ level }) => level === 1);
};
