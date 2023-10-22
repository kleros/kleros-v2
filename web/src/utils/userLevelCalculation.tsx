export const levelTitles = [
  { scoreRange: [0, 20], level: 0, title: "Diogenes" },
  { scoreRange: [20, 40], level: 1, title: "Pythagoras" },
  { scoreRange: [40, 60], level: 2, title: "Socrates" },
  { scoreRange: [60, 80], level: 3, title: "Plato" },
  { scoreRange: [80, 100], level: 4, title: "Aristotle" },
];

export const getCoherencyScore = (totalCoherent: number, totalDisputes: number): number =>
  totalCoherent / (Math.max(totalDisputes, 1) + 10);

export const getUserLevelData = (totalCoherent: number, totalDisputes: number) => {
  const coherencyScore = getCoherencyScore(totalCoherent, totalDisputes);
  const roundedCoherencyScore = Math.round(coherencyScore * 100);
  return (
    levelTitles.find(({ scoreRange }) => {
      return roundedCoherencyScore >= scoreRange[0] && roundedCoherencyScore < scoreRange[1];
    }) ?? levelTitles[0]
  );
};
