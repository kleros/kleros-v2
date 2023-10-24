export const levelTitles = [
  { scoreRange: [0, 20], level: 0, title: "Diogenes" },
  { scoreRange: [20, 40], level: 1, title: "Pythagoras" },
  { scoreRange: [40, 60], level: 2, title: "Socrates" },
  { scoreRange: [60, 80], level: 3, title: "Plato" },
  { scoreRange: [80, 100], level: 4, title: "Aristotle" },
];

export const getUserLevelData = (coherencyScore: number) => {
  return (
    levelTitles.find(({ scoreRange }) => {
      return coherencyScore >= scoreRange[0] && coherencyScore < scoreRange[1];
    }) ?? levelTitles[0]
  );
};
