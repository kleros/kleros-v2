import React from "react";

import { useTranslation } from "react-i18next";

import ChartIcon from "svgs/icons/chart.svg";
import PNKLogo from "svgs/styled/pnk.svg";

const Header: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex gap-[0_12px] items-center">
        <PNKLogo
          className={
            'w-[32px] h-[32px] [&_[class$="stop-1"]]:[stop-color:var(--klerosUIComponentsPrimaryBlue)] [&_[class$="stop-2"]]:[stop-color:var(--klerosUIComponentsSecondaryPurple)]'
          }
        />
        <p className="m-0 font-semibold">{t("stats.simulator")}</p>
      </div>
      <div className="flex gap-2 items-center">
        <ChartIcon className="[&_path]:fill-klerosUIComponentsPrimaryText" />
        <p className="m-0 text-[14px] font-semibold">{t("time_ranges.last_30_days")}</p>
      </div>
    </div>
  );
};
export default Header;
