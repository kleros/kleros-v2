import React from "react";

import { useTranslation } from "react-i18next";
import { Address } from "viem";

import ScoutIcon from "svgs/icons/scout.svg";

import { KLEROS_SCOUT_URL } from "consts/index";

import JurorLink from "components/JurorLink";

const getScoutProfileUrl = (address: string) => `${KLEROS_SCOUT_URL}/profile/pending?address=${address}`;

interface ITopContent {
  address: Address;
  totalResolvedDisputes: number;
}

const TopContent: React.FC<ITopContent> = ({ address, totalResolvedDisputes }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start gap-[8px_16px] flex-wrap lg:flex-row lg:items-center">
      <div className="flex flex-row items-center gap-[8px_16px] flex-wrap">
        <JurorLink {...{ address }} isInternalLink={false} />
        {totalResolvedDisputes > 0 ? (
          <label className="text-[14px]">{t("profile.juror_in_cases", { count: totalResolvedDisputes })}</label>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5 lg:ml-auto">
        <a
          href={getScoutProfileUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          title="Kleros Scout"
          className="flex items-center justify-center [transition:opacity_0.2s_ease,_scale_0.2s_ease] [&:hover]:[opacity:0.8] [&:hover]:[scale:1.1] [&_svg]:w-[28px] [&_svg]:h-[28px] [&_svg]:text-klerosUIComponentsPrimaryText"
        >
          <ScoutIcon />
        </a>
      </div>
    </div>
  );
};
export default TopContent;
