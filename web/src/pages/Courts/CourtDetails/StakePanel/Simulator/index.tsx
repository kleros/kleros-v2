import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { Address, formatEther } from "viem";
import { useAccount } from "wagmi";

import ArrowRightIcon from "svgs/icons/arrow-right.svg";
import DiceIcon from "svgs/icons/dice.svg";
import DollarIcon from "svgs/icons/dollar.svg";
import GavelIcon from "svgs/icons/gavel.svg";

import { CoinIds } from "consts/coingecko";
import { useCoinPrice } from "hooks/useCoinPrice";
import { beautifyStatNumber } from "utils/beautifyStatNumber";
import { formatUSD } from "utils/format";
import { isUndefined } from "utils/index";

import { useHomePageExtraStats } from "queries/useHomePageExtraStats";
import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";

import { Divider } from "components/Divider";
import WithHelpTooltip from "components/WithHelpTooltip";

import Info from "../../Info";

import Header from "./Header";
import QuantityToSimulate from "./QuantityToSimulate";

const calculateJurorOdds = (newStake: number, totalStake: number): string => {
  const odds = totalStake !== 0 ? (newStake * 100) / totalStake : 0;
  return `${odds.toFixed(2)}%`;
};

interface ISimulator {
  amountToStake: number;
  isStaking: boolean;
}

const Simulator: React.FC<ISimulator> = ({ amountToStake, isStaking }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { address } = useAccount();
  const { data: stakeData } = useJurorStakeDetailsQuery(address?.toLowerCase() as Address);
  const jurorStakeData = stakeData?.jurorTokensPerCourts?.find(({ court }) => court.id === id);
  const jurorCurrentEffectiveStake =
    address && jurorStakeData ? Number(formatEther(BigInt(jurorStakeData.effectiveStake))) : 0;
  const jurorCurrentSpecificStake = address && jurorStakeData ? Number(formatEther(BigInt(jurorStakeData.staked))) : 0;

  const timeframedCourtData = useHomePageExtraStats(30);
  const { prices: pricesData } = useCoinPrice([CoinIds.ETH]);
  const ethPriceUSD = pricesData ? pricesData[CoinIds.ETH]?.price : undefined;

  const foundCourt = useMemo(() => {
    return timeframedCourtData?.data?.courts?.find((c) => c.id === id);
  }, [timeframedCourtData, id]);

  const courtCurrentEffectiveStake = foundCourt ? Number(foundCourt.effectiveStake) / 1e18 : undefined;

  const currentTreeVotesPerPnk = foundCourt?.treeVotesPerPnk;
  const currentTreeDisputesPerPnk = foundCourt?.treeDisputesPerPnk;
  const currentTreeExpectedRewardPerPnk = foundCourt?.treeExpectedRewardPerPnk;

  const totals = useMemo(() => {
    if (isUndefined(courtCurrentEffectiveStake)) return {};
    return {
      votes: !isUndefined(currentTreeVotesPerPnk) ? courtCurrentEffectiveStake * currentTreeVotesPerPnk : undefined,
      cases: !isUndefined(currentTreeDisputesPerPnk)
        ? courtCurrentEffectiveStake * currentTreeDisputesPerPnk
        : undefined,
      rewards: !isUndefined(currentTreeExpectedRewardPerPnk)
        ? courtCurrentEffectiveStake * currentTreeExpectedRewardPerPnk
        : undefined,
    };
  }, [courtCurrentEffectiveStake, currentTreeVotesPerPnk, currentTreeDisputesPerPnk, currentTreeExpectedRewardPerPnk]);

  const { votes: totalVotes, rewards: totalRewards } = totals;

  const courtFutureEffectiveStake = !isUndefined(courtCurrentEffectiveStake)
    ? Math.max(isStaking ? courtCurrentEffectiveStake + amountToStake : courtCurrentEffectiveStake - amountToStake, 0)
    : undefined;

  const futureTreeVotesPerPnk =
    !isUndefined(courtFutureEffectiveStake) && !isUndefined(totalVotes)
      ? totalVotes / courtFutureEffectiveStake
      : undefined;

  const futureTreeExpectedRewardPerPnk =
    !isUndefined(courtFutureEffectiveStake) && !isUndefined(totalRewards)
      ? totalRewards / courtFutureEffectiveStake
      : undefined;

  const jurorFutureEffectiveStake = !isUndefined(jurorCurrentEffectiveStake)
    ? Math.max(isStaking ? jurorCurrentEffectiveStake + amountToStake : jurorCurrentEffectiveStake - amountToStake, 0)
    : undefined;

  const currentExpectedVotes =
    !isUndefined(jurorCurrentEffectiveStake) && !isUndefined(currentTreeVotesPerPnk)
      ? beautifyStatNumber(jurorCurrentEffectiveStake * currentTreeVotesPerPnk)
      : undefined;
  const futureExpectedVotes =
    !isUndefined(jurorFutureEffectiveStake) && !isUndefined(futureTreeVotesPerPnk)
      ? beautifyStatNumber(jurorFutureEffectiveStake * futureTreeVotesPerPnk)
      : undefined;

  const currentDrawingOdds =
    !isUndefined(jurorCurrentEffectiveStake) && !isUndefined(courtCurrentEffectiveStake)
      ? calculateJurorOdds(jurorCurrentEffectiveStake, courtCurrentEffectiveStake)
      : undefined;
  const futureDrawingOdds =
    !isUndefined(jurorFutureEffectiveStake) && !isUndefined(courtFutureEffectiveStake)
      ? calculateJurorOdds(jurorFutureEffectiveStake, courtFutureEffectiveStake)
      : undefined;

  const currentExpectedRewardsUSD =
    !isUndefined(jurorCurrentEffectiveStake) &&
    !isUndefined(currentTreeExpectedRewardPerPnk) &&
    !isUndefined(ethPriceUSD)
      ? formatUSD(jurorCurrentEffectiveStake * currentTreeExpectedRewardPerPnk * ethPriceUSD)
      : undefined;
  const futureExpectedRewardsUSD =
    !isUndefined(jurorFutureEffectiveStake) && !isUndefined(futureTreeExpectedRewardPerPnk) && !isUndefined(ethPriceUSD)
      ? formatUSD(jurorFutureEffectiveStake * futureTreeExpectedRewardPerPnk * ethPriceUSD)
      : undefined;

  const simulatorItems = [
    {
      title: t("stats.votes"),
      icon: <GavelIcon />,
      currentValue: currentExpectedVotes,
      futureValue: futureExpectedVotes,
    },
    {
      title: t("stats.drawing_odds"),
      icon: <DiceIcon />,
      currentValue: currentDrawingOdds,
      futureValue: futureDrawingOdds,
    },
    {
      title: t("stats.rewards"),
      icon: <DollarIcon />,
      currentValue: currentExpectedRewardsUSD,
      futureValue: futureExpectedRewardsUSD,
      tooltipMsg: t("tooltips.estimated_rewards_explanation"),
    },
  ];

  return (
    <div className="flex flex-col bg-klerosUIComponentsLightBlue [box-shadow:0px_4px_12px_rgba(0,_0,_0,_0.1)] p-4 rounded-[8px] border border-solid border-klerosUIComponentsMediumBlue justify-center lg:p-5">
      <Header />
      <Divider className="bg-klerosUIComponentsMediumBlue m-[12px_0_8px_0]" />
      <QuantityToSimulate {...{ jurorCurrentEffectiveStake, jurorCurrentSpecificStake, isStaking, amountToStake }} />
      <div className="flex flex-col gap-[8px_0] m-[24px_0_12px_0]">
        {simulatorItems.map((item) => (
          <div key={item.title} className="flex items-center text-[14px] justify-between">
            <div className="flex items-start flex-row gap-2 lg:items-center">
              <div className="[&_svg]:w-[14px] [&_svg]:h-[14px] [&_svg]:fill-klerosUIComponentsSecondaryPurple">
                {item.icon}
              </div>
              {item.tooltipMsg ? (
                <WithHelpTooltip place="top" tooltipMsg={item.tooltipMsg}>
                  <span className="text-klerosUIComponentsSecondaryText">{item.title}: </span>
                </WithHelpTooltip>
              ) : (
                <span className="text-klerosUIComponentsSecondaryText">{item.title}: </span>
              )}
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="font-semibold text-klerosUIComponentsSecondaryText">
                {!isUndefined(item.currentValue) ? item.currentValue : <Skeleton width={32} />}
              </span>
              <ArrowRightIcon
                className={isStaking ? "fill-klerosUIComponentsSuccess" : "fill-klerosUIComponentsWarning"}
              />
              <span className="font-semibold text-klerosUIComponentsPrimaryText">
                {!amountToStake || amountToStake === 0 ? "?" : null}
                {!isUndefined(amountToStake) &&
                  amountToStake > 0 &&
                  (!isUndefined(item.futureValue) ? item.futureValue : <Skeleton width={32} />)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Divider className="bg-klerosUIComponentsMediumBlue m-[12px_0_8px_0]" />
      <div className="pt-1">
        <Info />
      </div>
    </div>
  );
};

export default Simulator;
