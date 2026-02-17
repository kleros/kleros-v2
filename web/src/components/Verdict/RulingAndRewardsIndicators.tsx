import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import CheckCircle from "svgs/icons/check-circle-outline.svg";
import Hourglass from "svgs/icons/hourglass.svg";
import Coins from "svgs/icons/pile-coins.svg";

import Label from "components/DisputeView/CardLabels/Label";

const Container = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

interface IRulingAndRewardsIndicators {
  jurorRewardsDispersed: boolean;
  ruled: boolean;
}

const RulingAndRewardsIndicators: React.FC<IRulingAndRewardsIndicators> = ({ jurorRewardsDispersed, ruled }) => {
  const { t } = useTranslation();

  return (
    <Container>
      {ruled ? (
        <Label icon={CheckCircle} text={t("case_status.case_closed")} color="green" />
      ) : (
        <Label icon={Hourglass} text={t("case_status.case_in_progress")} color="blue" />
      )}
      {jurorRewardsDispersed ? (
        <Label icon={Coins} text={t("case_status.juror_rewards_distributed")} color="green" />
      ) : null}
    </Container>
  );
};

export default RulingAndRewardsIndicators;
