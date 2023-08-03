import React from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import { CircularProgress } from "@kleros/ui-components-library";
import WithHelpTooltip from "../WithHelpTooltip";
import { useUserQuery } from "queries/useUser";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const tooltipMsg =
  "A Coherent Vote is a vote coherent with the final jury decision" +
  " (after all the appeal instances). Your coherency score is calculated" +
  " using the number of times you have been coherent and the total cases you" +
  " have been in.";

const levelTitles = [
  { scoreRange: [0, 20], level: 0, title: "Diogenes" },
  { scoreRange: [20, 40], level: 1, title: "Pythagoras" },
  { scoreRange: [40, 60], level: 2, title: "Socrates" },
  { scoreRange: [60, 80], level: 3, title: "Plato" },
  { scoreRange: [80, 100], level: 4, title: "Aristotle" },
];

const Coherency: React.FC = () => {
  const { address } = useAccount();
  const { data } = useUserQuery(address?.toLowerCase());
  const totalCoherent = parseInt(data?.user?.totalCoherent) ?? 0;
  const totalResolvedDisputes = parseInt(data?.user?.totalResolvedDisputes) ?? 1;
  const coherencyScore = calculateCoherencyScore(totalCoherent, totalResolvedDisputes);
  const roundedCoherencyScore = Math.round(coherencyScore * 100);

  const { level, title } =
    levelTitles.find(({ scoreRange }) => {
      return roundedCoherencyScore >= scoreRange[0] && roundedCoherencyScore < scoreRange[1];
    }) || levelTitles[0];

  return (
    <Container>
      <small>{title}</small>
      <label>Level {level}</label>
      <CircularProgress
        progress={parseFloat(((totalCoherent / Math.max(totalResolvedDisputes, 1)) * 100).toFixed(2))}
      />
      <WithHelpTooltip place="left" {...{ tooltipMsg }}>
        <label>
          Coherency Score:
          <small> {coherencyScore.toFixed(2)} </small>
        </label>
      </WithHelpTooltip>
    </Container>
  );
};

const calculateCoherencyScore = (totalCoherent: number, totalDisputes: number): number =>
  totalCoherent / (Math.max(totalDisputes, 1) + 10);

export default Coherency;
