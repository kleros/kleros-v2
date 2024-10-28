import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

import { CoinIds } from "consts/coingecko";

import { formatUSD } from "utils/format";
import { commify } from "utils/commify";
import { isUndefined } from "utils/index";

import { useCoinPrice } from "hooks/useCoinPrice";
import { useHomePageExtraStats } from "queries/useHomePageExtraStats";
import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";

import GavelIcon from "svgs/icons/gavel.svg";
import LawBalanceIcon from "svgs/icons/law-balance.svg";
import DiceIcon from "svgs/icons/dice.svg";
import DollarIcon from "svgs/icons/dollar.svg";
import ArrowRightIcon from "svgs/icons/arrow-right.svg";

import Header from "./Header";
import QuantityToSimulate from "./QuantityToSimulate";
import Info from "../../Info";
import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 480px;
  background-color: ${({ theme }) => theme.lightBlue};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.mediumBlue};
  justify-content: center;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px 0;
  margin: 24px 0 12px 0;
`;

const SimulatorItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  justify-content: space-between;
`;

const IconWrapper = styled.div`
  svg {
    width: 14px;
    height: 14px;
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const Divider = styled.hr`
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.mediumBlue};
  margin: 12px 0 8px 0;
`;

const LeftContent = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  gap: 8px;

  ${landscapeStyle(
    () => css`
      align-items: center;
    `
  )}
`;

const RightContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.secondaryText};
`;

const StyledCurrentValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.secondaryText};
`;

const StyledFutureValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
`;

const StyledArrowRightIcon = styled(ArrowRightIcon)<{ isStaking: boolean }>`
  fill: ${({ theme, isStaking }) => (isStaking ? theme.success : theme.warning)};
`;

function beautifyStatNumber(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1e9) {
    return `${commify((value / 1e9).toFixed(2))}B`;
  } else if (absValue >= 1e6) {
    return `${commify((value / 1e6).toFixed(2))}M`;
  } else if (absValue >= 1e3) {
    return `${commify((value / 1e3).toFixed(0))}K`;
  } else if (absValue > 0 && absValue < 1) {
    return value.toFixed(2);
  }

  return commify(value.toFixed(0));
}

const calculateJurorOdds = (newStake: number, totalStake: number): string => {
  const odds = totalStake !== 0 ? (newStake * 100) / totalStake : 0;
  return `${odds.toFixed(2)}%`;
};

interface ISimulatorPopup {
  amountToStake: number;
  isStaking: boolean;
}

const SimulatorPopup: React.FC<ISimulatorPopup> = ({ amountToStake, isStaking }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: stakeData } = useJurorStakeDetailsQuery(address?.toLowerCase() as `0x${string}`);
  const courtStakeData = stakeData?.jurorTokensPerCourts?.find(({ court }) => court.id === id);
  const currentEffectiveStake = !isUndefined(courtStakeData) ? Number(formatEther(courtStakeData.effectiveStake)) : 0;
  const currentSpecificStake = !isUndefined(courtStakeData) ? Number(formatEther(courtStakeData.staked)) : 0;

  const timeframedCourtData = useHomePageExtraStats(30);
  const { prices: pricesData } = useCoinPrice([CoinIds.ETH, CoinIds.PNK]);
  const ethPriceUSD = pricesData ? pricesData[CoinIds.ETH]?.price : undefined;

  const foundCourt = useMemo(() => {
    return timeframedCourtData?.data?.courts?.find((c) => c.id === id);
  }, [timeframedCourtData, id]);

  const effectiveStakeAsNumber = foundCourt ? Number(foundCourt.effectiveStake) / 1e18 : 0;

  const currentTreeVotesPerPnk = foundCourt ? foundCourt.treeVotesPerPnk : 0;
  const currentTreeDisputesPerPnk = foundCourt ? foundCourt.treeDisputesPerPnk : 0;
  const currentTreeExpectedRewardPerPnk = foundCourt ? foundCourt.treeExpectedRewardPerPnk : 0;

  const totalVotes = effectiveStakeAsNumber * currentTreeVotesPerPnk;
  const totalCases = effectiveStakeAsNumber * currentTreeDisputesPerPnk;
  const totalRewards = effectiveStakeAsNumber * currentTreeExpectedRewardPerPnk;

  const futureTotalEffectiveStake = Math.max(
    isStaking ? effectiveStakeAsNumber + amountToStake : effectiveStakeAsNumber - amountToStake,
    0
  );

  const futureTreeVotesPerPnk = futureTotalEffectiveStake !== 0 ? totalVotes / futureTotalEffectiveStake : 0;
  const futureTreeDisputesPerPnk = futureTotalEffectiveStake !== 0 ? totalCases / futureTotalEffectiveStake : 0;
  const futureTreeExpectedRewardPerPnk = futureTotalEffectiveStake !== 0 ? totalRewards / futureTotalEffectiveStake : 0;

  const futureEffectiveStake = Math.max(
    isStaking ? currentEffectiveStake + amountToStake : currentEffectiveStake - amountToStake,
    0
  );

  const currentExpectedVotes = beautifyStatNumber(currentEffectiveStake * currentTreeVotesPerPnk);
  const futureExpectedVotes = beautifyStatNumber(futureEffectiveStake * futureTreeVotesPerPnk);

  const currentExpectedCases = beautifyStatNumber(currentEffectiveStake * currentTreeDisputesPerPnk);
  const futureExpectedCases = beautifyStatNumber(futureEffectiveStake * futureTreeDisputesPerPnk);

  const currentDrawingOdds =
    effectiveStakeAsNumber && calculateJurorOdds(currentEffectiveStake, effectiveStakeAsNumber);
  const futureDrawingOdds =
    effectiveStakeAsNumber && calculateJurorOdds(futureEffectiveStake, futureTotalEffectiveStake);

  const currentExpectedRewardsUSD = formatUSD(
    currentEffectiveStake * currentTreeExpectedRewardPerPnk * (ethPriceUSD || 0)
  );
  const futureExpectedRewardsUSD = formatUSD(
    futureEffectiveStake * futureTreeExpectedRewardPerPnk * (ethPriceUSD || 0)
  );

  const simulatorItems = [
    {
      title: "Votes",
      icon: <GavelIcon />,
      currentValue: `${currentExpectedVotes}`,
      futureValue: `${futureExpectedVotes}`,
    },
    {
      title: "Cases",
      icon: <LawBalanceIcon />,
      currentValue: `${currentExpectedCases}`,
      futureValue: `${futureExpectedCases}`,
    },
    {
      title: "Drawing Odds",
      icon: <DiceIcon />,
      currentValue: `${currentDrawingOdds}`,
      futureValue: `${futureDrawingOdds}`,
    },
    {
      title: "Rewards",
      icon: <DollarIcon />,
      currentValue: `${currentExpectedRewardsUSD}`,
      futureValue: `${futureExpectedRewardsUSD}`,
      tooltipMsg:
        "Estimated rewards in USD, assuming 100% coherent voting. If other jurors vote incoherently, additional rewards in the form of PNK tokens may be earned beyond this estimate.",
    },
  ];

  return (
    <Container>
      <Header />
      <Divider />
      <QuantityToSimulate {...{ currentEffectiveStake, currentSpecificStake, isStaking, amountToStake }} />
      <ItemsContainer>
        {simulatorItems.map((item, index) => (
          <SimulatorItem key={index}>
            <LeftContent>
              <IconWrapper>{item.icon}</IconWrapper>
              {item.tooltipMsg ? (
                <WithHelpTooltip place="top" tooltipMsg={item.tooltipMsg}>
                  <StyledTitle>{item.title}: </StyledTitle>
                </WithHelpTooltip>
              ) : (
                <StyledTitle>{item.title}: </StyledTitle>
              )}
            </LeftContent>
            <RightContent>
              <StyledCurrentValue>
                {!item.currentValue.includes("undefined") ? item.currentValue : <Skeleton width={32} />}
              </StyledCurrentValue>
              <StyledArrowRightIcon {...{ isStaking }} />
              <StyledFutureValue>
                {!amountToStake || amountToStake === 0 ? "Enter amount" : null}
                {!isUndefined(amountToStake) &&
                  amountToStake > 0 &&
                  (!item.futureValue.includes("undefined") ? item.futureValue : <Skeleton width={32} />)}
              </StyledFutureValue>
            </RightContent>
          </SimulatorItem>
        ))}
      </ItemsContainer>
      <Divider />
      <Info />
    </Container>
  );
};

export default SimulatorPopup;
