import React from "react";
import styled from "styled-components";
import TokenRewards from "./TokenRewards";
import WithHelpTooltip from "../WithHelpTooltip";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const tooltipMsg =
  "Users have an economic interest in serving as jurors in Kleros: " +
  "collecting the Juror Rewards in exchange for their work. Each juror who " +
  "is coherent with the final ruling receive the Juror Rewards composed of " +
  "arbitration fees (ETH) + PNK redistribution between jurors.";

const Coherency: React.FC = () => {
  return (
    <Container>
      <WithHelpTooltip place="bottom" {...{ tooltipMsg }}>
        <label> Juror Rewards </label>
      </WithHelpTooltip>
      <TokenRewards token="ETH" amount="3.66" value="208,783" />
      <TokenRewards token="PNK" amount="56,000" value="20,783" />
    </Container>
  );
};

export default Coherency;
