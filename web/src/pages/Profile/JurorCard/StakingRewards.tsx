import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { Box as _Box, Button } from "@kleros/ui-components-library";

import { EnsureChain } from "components/EnsureChain";
import WithHelpTooltip from "components/WithHelpTooltip";

// import TokenRewards from "./TokenRewards";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
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
  const { t } = useTranslation();

  return (
    <Box>
      <UnclaimedContainer>
        <label> {t("profile.unclaimed")} </label>
        <small> 1,000 PNK </small>
      </UnclaimedContainer>
      <EnsureChain>
        <Button small variant="tertiary" text={t("buttons.claim")} />
      </EnsureChain>
    </Box>
  );
};

const tooltipMsg =
  "Staking Rewards are the rewards won by staking your PNK on a court during " +
  "the Kleros' Jurors incentive program. This will start as soon as the " +
  "corresponding KIP (Kleros Improvement Proposal) goes into effect.";

const StakingRewards: React.FC = () => {
  return (
    // <Container>
    //   <WithHelpTooltip place="bottom" {...{ tooltipMsg }}>
    //     <label>
    //       Staking Rewards: <small>APY 6%</small>
    //     </label>
    //     Coming soon
    //   </WithHelpTooltip>
    //   <TokenRewards token="PNK" amount="10,000" value="8,783" />
    //   <ClaimPNK />
    // </Container>
    <Container>
      <WithHelpTooltip place="bottom" {...{ tooltipMsg }}>
        <label>Staking Rewards</label>
      </WithHelpTooltip>
      <label>Coming soon</label>
    </Container>
  );
};

export default StakingRewards;
