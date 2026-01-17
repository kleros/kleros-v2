export interface ILevelCriteria {
  level: number;
  titleKey: string;
  minCoherenceScore: number;
  maxCoherenceScore: number;
}

const levelCriteria: ILevelCriteria[] = [
  { level: 0, titleKey: "juror_levels.diogenes", minCoherenceScore: 0, maxCoherenceScore: 24 },
  { level: 1, titleKey: "juror_levels.pythagoras", minCoherenceScore: 25, maxCoherenceScore: 49 },
  { level: 2, titleKey: "juror_levels.socrates", minCoherenceScore: 50, maxCoherenceScore: 69 },
  { level: 3, titleKey: "juror_levels.plato", minCoherenceScore: 70, maxCoherenceScore: 89 },
  { level: 4, titleKey: "juror_levels.aristotle", minCoherenceScore: 90, maxCoherenceScore: 100 },
];

export const getUserLevelData = (coherenceScore: number) => {
  for (const criteria of levelCriteria) {
    if (coherenceScore >= criteria.minCoherenceScore && coherenceScore <= criteria.maxCoherenceScore) {
      return criteria;
    }
  }
  return levelCriteria[0];
};
