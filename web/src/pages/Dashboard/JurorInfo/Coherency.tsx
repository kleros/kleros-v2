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

const Coherency: React.FC = () => {
  const { address } = useAccount();
  const { data } = useUserQuery(address?.toLowerCase());
  const totalCoherent = parseInt(data?.user?.totalCoherent) ?? 0;
  const totalDisputes = parseInt(data?.user?.totalCoherent) ?? 1;
  const coherencyScore = calculateCoherencyScore(totalCoherent, totalDisputes);

  return (
    <Container>
      <small>Aristotle</small>
      <label>Level 4</label>
      <CircularProgress progress={(totalCoherent / totalDisputes) * 100} />
      <WithHelpTooltip place="left" {...{ tooltipMsg }}>
        <label>
          Coherency Score:
          <small> {coherencyScore.toFixed(3)} </small>
        </label>
      </WithHelpTooltip>
    </Container>
  );
};

const calculateCoherencyScore = (totalCoherent: number, totalDisputes: number): number =>
  totalCoherent / (totalDisputes + 10);

export default Coherency;
