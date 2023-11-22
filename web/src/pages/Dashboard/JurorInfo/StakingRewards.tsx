import React from "react";
import styled from "styled-components";
import { useToggle } from "react-use";
import { Box as _Box, Button } from "@kleros/ui-components-library";
import TokenRewards from "./TokenRewards";
import WithHelpTooltip from "../WithHelpTooltip";
import ClaimedStakingRewards from "components/Popup/ClaimedStakingRewards";
import { EnsureChain } from "components/EnsureChain";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(8px + (32 - 8) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Box = styled(_Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  padding-left: 20px;
  width: calc(232px + (312 - 232) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  height: auto;
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.lightBlue};
  gap: calc(12px + (28 - 12) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const UnclaimedContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const StyledSmall = styled.small`
  font-size: 16px;
`;

const ClaimPNK: React.FC = () => {
  const [isClaimRewardsModalOpen, toggleClaimRewardsModal] = useToggle(false);

  return (
    <>
      <Box>
        <UnclaimedContainer>
          <label> Unclaimed: </label>
          <StyledSmall> 1,000 PNK </StyledSmall>
        </UnclaimedContainer>
        <EnsureChain>
          <Button small variant="tertiary" text="Claim" onClick={toggleClaimRewardsModal} />
        </EnsureChain>
      </Box>
      {isClaimRewardsModalOpen && <ClaimedStakingRewards toggleIsOpen={toggleClaimRewardsModal} />}
    </>
  );
};

const tooltipMsg =
  "Staking Rewards are the rewards won by staking your PNK on a court during " +
  "the Kleros' Jurors incentive program." +
  " APY means Annual Percentage Yield, and it is the rate of interest earned" +
  " on your staked PNK in one year.";

const StakingRewards: React.FC = () => {
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

export default StakingRewards;
