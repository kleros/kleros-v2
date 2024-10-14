import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";

import { CoinIds } from "consts/coingecko";

import { formatUSD } from "utils/format";
import { commify } from "utils/commify";

import { useHomePageExtraStats } from "queries/useHomePageExtraStats";
import { useCoinPrice } from "hooks/useCoinPrice";

const SimulatorPopupContainer = styled.div`
  position: absolute;
  top: 100px;
  right: 50px;
  width: 400px;
  background-color: ${({ theme }) => theme.lightBlue};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 8px;
  border: 1px ${({ theme }) => theme.mediumBlue};
`;

const SimulatorItem = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 14px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.secondaryText};
  gap: 4px;
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

  return (
    <SimulatorPopupContainer>
      <SimulatorItem>
        <strong>Cases</strong>
        You would have been drawn in: {expectedCases} cases
      </SimulatorItem>
      <SimulatorItem>
        <strong>Votes</strong>
        You would have: {expectedVotes} votes
      </SimulatorItem>
      <SimulatorItem>
        <strong>Rewards</strong>
        Potential earnings: {expectedRewardsUSD}
      </SimulatorItem>
      <SimulatorItem>
        <strong>Juror Odds</strong>
        Your juror odds: {jurorOdds}
      </SimulatorItem>
    </SimulatorPopupContainer>
  );
};

export default SimulatorPopup;
