import React from "react";

import { useTranslation } from "react-i18next";

import { Box } from "@kleros/ui-components-library";

import BalanceIcon from "svgs/icons/law-balance.svg";

const PendingVotesBox: React.FC<{ current: number; total: number; court: string }> = ({ current, total, court }) => {
  const { t } = useTranslation();

  return (
    <Box className="w-full bg-klerosUIComponentsLightBlue h-auto rounded-[3px] p-4 flex gap-2.5 items-center -mb-1 [&_>_p]:m-0 [&_>_svg]:h-[16px] [&_>_svg]:fill-klerosUIComponentsSecondaryPurple">
      <BalanceIcon />
      <p className="font-normal">
        {current === total
          ? t("case_status.all_jurors_voted")
          : t("case_status.votes_cast_status", { current, total, court, count: current })}
      </p>
    </Box>
  );
};

export default PendingVotesBox;
