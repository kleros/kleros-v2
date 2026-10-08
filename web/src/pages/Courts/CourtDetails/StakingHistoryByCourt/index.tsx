import React from "react";

import { useTranslation } from "react-i18next";

import { getDescriptiveCourtName } from "utils/getDescriptiveCourtName";

import DisplayStakes from "./DisplayStakes";
import Search from "./Search";

const StakingHistoryByCourt: React.FC<{ courtName: string | undefined }> = ({ courtName }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-[578px]">
      <h1 className="mb-[calc(12px_+_(16_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
        {t("profile.staking_history_in_court", { court: getDescriptiveCourtName(courtName) })}
      </h1>
      <Search />
      <DisplayStakes />
    </div>
  );
};

export default StakingHistoryByCourt;
