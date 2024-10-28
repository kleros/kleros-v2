import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

import { CoinIds } from "consts/coingecko";

import { formatUSD } from "utils/format";
import { isUndefined } from "utils/index";
import { beautifyStatNumber } from "utils/beautifyStatNumber";

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
import { Divider } from "components/Divider";

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

const StyledDivider = styled(Divider)`
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

const InfoContainer = styled.div`
  padding-top: 4px;
`;

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
  const jurorCurrentEffectiveStake = address
    ? !isUndefined(courtStakeData)
      ? Number(formatEther(courtStakeData.effectiveStake))
      : undefined
    : 0;
  const jurorCurrentSpecificStake = address
    ? !isUndefined(courtStakeData)
      ? Number(formatEther(courtStakeData.staked))
      : undefined
    : 0;

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

  const totalVotes =
    !isUndefined(courtCurrentEffectiveStake) && !isUndefined(currentTreeVotesPerPnk)
      ? courtCurrentEffectiveStake * currentTreeVotesPerPnk
      : undefined;
  const totalCases =
    !isUndefined(courtCurrentEffectiveStake) && !isUndefined(currentTreeDisputesPerPnk)
      ? courtCurrentEffectiveStake * currentTreeDisputesPerPnk
      : undefined;
  const totalRewards =
    !isUndefined(courtCurrentEffectiveStake) && !isUndefined(currentTreeExpectedRewardPerPnk)
      ? courtCurrentEffectiveStake * currentTreeExpectedRewardPerPnk
      : undefined;

  const courtFutureEffectiveStake = !isUndefined(courtCurrentEffectiveStake)
    ? Math.max(isStaking ? courtCurrentEffectiveStake + amountToStake : courtCurrentEffectiveStake - amountToStake, 0)
    : undefined;

  const futureTreeVotesPerPnk =
    !isUndefined(courtFutureEffectiveStake) && !isUndefined(totalVotes)
      ? totalVotes / courtFutureEffectiveStake
      : undefined;
  const futureTreeDisputesPerPnk =
    !isUndefined(courtFutureEffectiveStake) && !isUndefined(totalCases)
      ? totalCases / courtFutureEffectiveStake
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

  const currentExpectedCases =
    !isUndefined(jurorCurrentEffectiveStake) && !isUndefined(currentTreeDisputesPerPnk)
      ? beautifyStatNumber(jurorCurrentEffectiveStake * currentTreeDisputesPerPnk)
      : undefined;
  const futureExpectedCases =
    !isUndefined(jurorFutureEffectiveStake) && !isUndefined(futureTreeDisputesPerPnk)
      ? beautifyStatNumber(jurorFutureEffectiveStake * futureTreeDisputesPerPnk)
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
      title: "Votes",
      icon: <GavelIcon />,
      currentValue: currentExpectedVotes,
      futureValue: futureExpectedVotes,
    },
    {
      title: "Cases",
      icon: <LawBalanceIcon />,
      currentValue: currentExpectedCases,
      futureValue: futureExpectedCases,
    },
    {
      title: "Drawing Odds",
      icon: <DiceIcon />,
      currentValue: currentDrawingOdds,
      futureValue: futureDrawingOdds,
    },
    {
      title: "Rewards",
      icon: <DollarIcon />,
      currentValue: currentExpectedRewardsUSD,
      futureValue: futureExpectedRewardsUSD,
      tooltipMsg:
        "Estimated rewards in USD, assuming 100% coherent voting. If other jurors vote incoherently, additional rewards in the form of PNK tokens may be earned beyond this estimate.",
    },
  ];

  return (
    <Container>
      <Header />
      <StyledDivider />
      <QuantityToSimulate {...{ jurorCurrentEffectiveStake, jurorCurrentSpecificStake, isStaking, amountToStake }} />
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
                {!isUndefined(item.currentValue) ? item.currentValue : <Skeleton width={32} />}
              </StyledCurrentValue>
              <StyledArrowRightIcon {...{ isStaking }} />
              <StyledFutureValue>
                {!amountToStake || amountToStake === 0 ? "Enter amount" : null}
                {!isUndefined(amountToStake) &&
                  amountToStake > 0 &&
                  (!isUndefined(item.futureValue) ? item.futureValue : <Skeleton width={32} />)}
              </StyledFutureValue>
            </RightContent>
          </SimulatorItem>
        ))}
      </ItemsContainer>
      <StyledDivider />
      <InfoContainer>
        <Info />
      </InfoContainer>
    </Container>
  );
};

export default SimulatorPopup;
