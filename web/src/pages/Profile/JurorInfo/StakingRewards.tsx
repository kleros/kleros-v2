import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { Box as _Box, Button } from "@kleros/ui-components-library";

import { EnsureChain } from "components/EnsureChain";
import WithHelpTooltip from "components/WithHelpTooltip";

import TokenRewards from "./TokenRewards";

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

const Coherence: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <WithHelpTooltip place="bottom" tooltipMsg={t("profile.staking_rewards_tooltip")}>
        <label>
          {t("profile.staking_rewards")}: <small>{t("profile.apy_label")}</small>
        </label>
      </WithHelpTooltip>
      <TokenRewards token="PNK" amount="10,000" value="8,783" />
      <ClaimPNK />
    </Container>
  );
};

export default Coherence;
