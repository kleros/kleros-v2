import React from "react";

import { Trans, useTranslation } from "react-i18next";

import { Box } from "@kleros/ui-components-library";

import HourglassIcon from "svgs/icons/hourglass.svg";

import { useOptionsContext } from "hooks/useClassicAppealContext";
import { secondsToDayHourMinute } from "utils/date";
import { isUndefined } from "utils/index";

interface IStageExplainer {
  countdown: number | undefined;
  stage: 1 | 2;
}

const StageOneExplanation: React.FC = () => {
  return (
    <div>
      <p>
        <Trans i18nKey="appeal.stage_one_explanation_1" components={{ small: <small /> }} />
      </p>
      <p>
        <Trans i18nKey="appeal.stage_one_explanation_2" components={{ small: <small /> }} />
      </p>
    </div>
  );
};

const StageTwoExplanation: React.FC = () => {
  const options = useOptionsContext();
  const fundedOptions = options?.filter((option) => option?.funded).map((option) => option.title);
  return (
    <div>
      <p>
        <Trans i18nKey="appeal.stage_two_explanation_1" components={{ small: <small /> }} />
      </p>
      <p>
        <Trans i18nKey="appeal.stage_two_explanation_2" components={{ small: <small /> }} />
      </p>
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
    <Box className="rounded-[3px] m-[24px_0] h-auto w-full p-[16px_24px] [&_>_div_>_p]:block [&_>_div_>_p]:mb-1">
      <label className="flex items-center justify-center pb-3 mb-3 [border-bottom:1px_solid_var(--klerosUIComponentsSecondaryPurple)] text-klerosUIComponentsPrimaryText gap-2 [&_>_svg]:w-[14px] [&_>_svg]:fill-klerosUIComponentsSecondaryPurple">
        {!isUndefined(countdown) ? (
          <>
            <HourglassIcon />
            {countdown > 0 ? secondsToDayHourMinute(countdown) : <span>{t("appeal.times_up")}</span>}
          </>
        ) : null}
      </label>
      {stage === 1 ? <StageOneExplanation /> : <StageTwoExplanation />}
    </Box>
  );
};

export default StageExplainer;
