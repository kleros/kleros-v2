interface ILevelCriteria {
  level: number;
  title: string;
  minDisputes: number;
  minCoherencePercentage: number;
  maxCoherencePercentage: number;
}

const levelCriteria: ILevelCriteria[] = [
  { level: 4, title: "Aristotle", minDisputes: 10, minCoherencePercentage: 90, maxCoherencePercentage: 100 },
  { level: 3, title: "Plato", minDisputes: 7, minCoherencePercentage: 80, maxCoherencePercentage: 100 },
  { level: 2, title: "Socrates", minDisputes: 3, minCoherencePercentage: 70, maxCoherencePercentage: 100 },
  { level: 1, title: "Pythagoras", minDisputes: 1, minCoherencePercentage: 0, maxCoherencePercentage: 70 },
  { level: 0, title: "Diogenes", minDisputes: 3, minCoherencePercentage: 0, maxCoherencePercentage: 49 },
];

export const getUserLevelData = (coherencePercentage: string, totalResolvedDisputes: number) => {
  const percentageToNumber = (percentage: string) => parseFloat(percentage.replace("%", ""));
  const coherenceValue = percentageToNumber(coherencePercentage);

  for (const criteria of levelCriteria) {
    if (
      totalResolvedDisputes >= criteria.minDisputes &&
      coherenceValue >= criteria.minCoherencePercentage &&
      coherenceValue <= criteria.maxCoherencePercentage
    ) {
      return criteria;
    }
  }

  return levelCriteria.find(({ level }) => level === 1);
};
