import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { useParams } from "react-router-dom";

import { CoinIds } from "consts/coingecko";

import { formatUSD } from "utils/format";
import { commify } from "utils/commify";

import { useCoinPrice } from "hooks/useCoinPrice";
import { useHomePageExtraStats } from "queries/useHomePageExtraStats";

import LawBalanceIcon from "svgs/icons/law-balance.svg";
import PNKIcon from "svgs/icons/pnk.svg";
import PileCoinsIcon from "svgs/icons/pile-coins.svg";
import DiceIcon from "svgs/icons/dice.svg";

import Header from "./Header";
import Info from "../../Info";

const SimulatorPopupContainer = styled.div`
  position: absolute;
  top: 200px;
  left: 50%;
  transform: translateX(-50%);
  width: ${responsiveSize(344, 480)};
  background-color: ${({ theme }) => theme.lightBlue};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.mediumBlue};

  ${landscapeStyle(
    () => css`
      top: -4px;
      left: auto;
      right: 0px;
      transform: none;
    `
  )}
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px 0;
  margin-bottom: 32px;
`;

const SimulatorItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
`;

const IconWrapper = styled.div`
  display: flex;
  svg {
    width: 14px;
    height: 14px;
    fill: ${({ theme }) => theme.secondaryPurple};
  }
  margin-right: 8px;
`;

const Divider = styled.hr`
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.mediumBlue};
  margin: 12px 0 16px 0;
`;

const StyledDescription = styled.span`
  margin-right: 4px;
  color: ${({ theme }) => theme.secondaryText};
`;

const StyledValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
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

const calculateJurorOdds = (stakingAmount: number, totalStake: number): string => {
  const odds = (stakingAmount * 100) / totalStake;
  return `${odds.toFixed(2)}%`;
};

const SimulatorPopup: React.FC<{ stakingAmount: number }> = ({ stakingAmount }) => {
  const [courtData, setCourtData] = useState<any>(null);
  const { id } = useParams();

  const timeframedCourtData = useHomePageExtraStats(30);
  const { prices: pricesData } = useCoinPrice([CoinIds.ETH]);
  const ethPriceUSD = pricesData ? pricesData[CoinIds.ETH]?.price : undefined;

  useEffect(() => {
    if (timeframedCourtData?.data?.courts) {
      const foundCourt = timeframedCourtData?.data?.courts.find((c) => c.id === id);
      if (foundCourt) {
        setCourtData(foundCourt);
      }
    }
  }, [timeframedCourtData, id]);

  if (!courtData) return null;

  const effectiveStakeAsNumber = Number(courtData.effectiveStake) / 1e18;
  const expectedCases = beautifyStatNumber(stakingAmount * courtData.treeDisputesPerPnk);
  const expectedVotes = beautifyStatNumber(stakingAmount * courtData.treeVotesPerPnk);
  const expectedRewardsUSD = formatUSD(courtData.treeExpectedRewardPerPnk * stakingAmount * ethPriceUSD);
  const jurorOdds = calculateJurorOdds(stakingAmount, effectiveStakeAsNumber + stakingAmount);

  const simulatorItems = [
    { icon: <LawBalanceIcon />, description: "You would have been selected in", value: `${expectedCases} case(s)` },
    { icon: <PNKIcon />, description: "You would have had", value: `${expectedVotes} vote(s)` },
    { icon: <PileCoinsIcon />, description: "You would have earned", value: `${expectedRewardsUSD}` },
    { icon: <DiceIcon />, description: "Your juror odds would have been", value: `${jurorOdds}` },
  ];

  return (
    <SimulatorPopupContainer>
      <Header />
      <Divider />
      <ItemsContainer>
        {simulatorItems.map((item, index) => (
          <SimulatorItem key={index}>
            <IconWrapper>{item.icon}</IconWrapper>
            <StyledDescription>{item.description} </StyledDescription>
            <StyledValue>{item.value}</StyledValue>
          </SimulatorItem>
        ))}
      </ItemsContainer>
      <Info />
    </SimulatorPopupContainer>
  );
};

export default SimulatorPopup;
