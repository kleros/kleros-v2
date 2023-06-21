import React from "react";
import styled from "styled-components";
import { Box as _Box, Button } from "@kleros/ui-components-library";
import { useNetwork } from "wagmi";
import TokenRewards from "./TokenRewards";
import WithHelpTooltip from "../WithHelpTooltip";
import ConnectButton from "components/ConnectButton";
import { DEFAULT_CHAIN } from "consts/chains";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Box = styled(_Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  width: 270px;
  height: auto;
  border-radius: 3px;
`;

const UnclaimedContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const ClaimPNK: React.FC = () => {
  const { chain } = useNetwork();

  return (
    <Box>
      <UnclaimedContainer>
        <label> Unclaimed: </label>
        <small> 1,000 PNK </small>
      </UnclaimedContainer>
      {chain && chain.id === DEFAULT_CHAIN ? <Button small variant="tertiary" text="Claim" /> : <ConnectButton />}
    </Box>
  );
};

const tooltipMsg =
  "Staking Rewards are the rewards won by staking your PNK on a court during " +
  "the Kleros' Jurors incentive program.";

const Coherency: React.FC = () => {
  return (
    <Container>
      <WithHelpTooltip place="bottom" {...{ tooltipMsg }}>
        <label>
          Staking Rewards: <small>APY 6%</small>
        </label>
      </WithHelpTooltip>
      <TokenRewards token="PNK" amount="10,000" value="8,783" />
      <ClaimPNK />
    </Container>
  );
};

export default Coherency;
