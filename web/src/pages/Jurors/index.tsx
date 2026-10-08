import React from "react";

import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import ArrowIcon from "svgs/icons/arrow.svg";

import { useTotalLeaderboardJurors } from "queries/useTotalLeaderboardJurors";

import { isUndefined } from "src/utils";

import ScrollTop from "components/ScrollTop";
import { StyledArrowLink } from "components/StyledArrowLink";

import DisplayJurors from "./DisplayJurors";
import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";

const Jurors: React.FC = () => {
  const { t } = useTranslation();
  const { data: queryTotalLeaderBoardJurors } = useTotalLeaderboardJurors();
  const rawTotalLeaderboardJurors = queryTotalLeaderBoardJurors?.counter?.totalLeaderboardJurors;
  const totalLeaderboardJurors = isUndefined(rawTotalLeaderboardJurors) ? undefined : Number(rawTotalLeaderboardJurors);
  const { isConnected } = useAccount();

  return (
    <>
      <div className="w-full bg-klerosUIComponentsLightBackground p-[32px_16px_40px] max-w-[1400px] m-[0_auto] lg:p-[48px_calc(0px_+_(132_-_0)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_60px]">
        <div className="flex flex-row justify-between flex-wrap mb-[calc(12px_+_(24_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] gap-1">
          <h1 className="m-0 text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
            {t("misc.jurors_leaderboard")}
          </h1>
          {isConnected ? (
            <StyledArrowLink to="/profile/stakes/1">
              {t("navigation.my_profile")} <ArrowIcon />
            </StyledArrowLink>
          ) : null}
        </div>
        <Search />
        <StatsAndFilters totalJurors={totalLeaderboardJurors} />
        <DisplayJurors totalLeaderboardJurors={totalLeaderboardJurors} />
      </div>
      <ScrollTop />
    </>
  );
};

export default Jurors;
