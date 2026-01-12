import React from "react";
import styled from "styled-components";

import { Trans, useTranslation } from "react-i18next";

import { Box } from "@kleros/ui-components-library";

import HourglassIcon from "svgs/icons/hourglass.svg";

import { useOptionsContext } from "hooks/useClassicAppealContext";
import { secondsToDayHourMinute } from "utils/date";
import { isUndefined } from "utils/index";

const StyledBox = styled(Box)`
  border-radius: 3px;
  margin: 24px 0;
  height: auto;
  width: 100%;
  padding: 16px 24px;
  & > div > p {
    display: block;
    margin-bottom: 4px;
  }
`;

const CountdownLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.secondaryPurple};
  color: ${({ theme }) => theme.primaryText};
  gap: 8px;
  & > svg {
    width: 14px;
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

interface IStageExplainer {
  countdown: number | undefined;
  stage: 1 | 2;
}

const StageOneExplanation: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <p dangerouslySetInnerHTML={{ __html: t("appeal.stage_one_explanation_1") }} />
      <p dangerouslySetInnerHTML={{ __html: t("appeal.stage_one_explanation_2") }} />
    </div>
  );
};

const StageTwoExplanation: React.FC = () => {
  const { t } = useTranslation();
  const options = useOptionsContext();
  const fundedOptions = options?.filter((option) => option?.funded).map((option) => option.title);
  return (
    <div>
      <p dangerouslySetInnerHTML={{ __html: t("appeal.stage_two_explanation_1") }} />
      <p dangerouslySetInnerHTML={{ __html: t("appeal.stage_two_explanation_2") }} />
      <p>
        <Trans
          i18nKey="appeal.stage_two_explanation_3"
          values={{ choices: fundedOptions?.join(", ") || "" }}
          components={{ small: <small /> }}
        />
      </p>
    </div>
  );
};

const StageExplainer: React.FC<IStageExplainer> = ({ countdown, stage }) => {
  const { t } = useTranslation();
  return (
    <StyledBox>
      <CountdownLabel>
        {!isUndefined(countdown) ? (
          <>
            <HourglassIcon />
            {countdown > 0 ? secondsToDayHourMinute(countdown) : <span>{t("appeal.times_up")}</span>}
          </>
        ) : null}
      </CountdownLabel>
      {stage === 1 ? <StageOneExplanation /> : <StageTwoExplanation />}
    </StyledBox>
  );
};

export default StageExplainer;
