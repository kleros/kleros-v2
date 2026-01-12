export interface ILevelCriteria {
  level: number;
  title: string;
  minCoherenceScore: number;
  maxCoherenceScore: number;
}

const levelCriteria: ILevelCriteria[] = [
  { level: 0, title: "Diogenes", minCoherenceScore: 0, maxCoherenceScore: 24 },
  { level: 1, title: "Pythagoras", minCoherenceScore: 25, maxCoherenceScore: 49 },
  { level: 2, title: "Socrates", minCoherenceScore: 50, maxCoherenceScore: 69 },
  { level: 3, title: "Plato", minCoherenceScore: 70, maxCoherenceScore: 89 },
  { level: 4, title: "Aristotle", minCoherenceScore: 90, maxCoherenceScore: 100 },
];

export const getUserLevelData = (coherenceScore: number) => {
  for (const criteria of levelCriteria) {
    if (coherenceScore >= criteria.minCoherenceScore && coherenceScore <= criteria.maxCoherenceScore) {
      return criteria;
    }
  }
  return levelCriteria[0];
};
