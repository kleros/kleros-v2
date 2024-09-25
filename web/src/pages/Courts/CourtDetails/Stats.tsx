import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useParams } from "react-router-dom";

import EthereumIcon from "svgs/icons/ethereum.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import BalanceWithPNKIcon from "svgs/icons/law-balance-with-pnk.svg";
import MinStake from "svgs/icons/min-stake.svg";
import VotesPerPNKIcon from "svgs/icons/votes-per-pnk.svg";
import PNKIcon from "svgs/icons/pnk.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import VoteStake from "svgs/icons/vote-stake.svg";
import RewardsPerPnk from "svgs/icons/rewards-per-pnk.svg";

import { CoinIds } from "consts/coingecko";
import { useCoinPrice } from "hooks/useCoinPrice";
import { calculateSubtextRender } from "utils/calculateSubtextRender";
import { formatETH, formatPNK, formatUnitsWei, formatUSD } from "utils/format";
import { isUndefined } from "utils/index";

import { useCourtDetails, CourtDetailsQuery } from "queries/useCourtDetails";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import { StyledSkeleton } from "components/StyledSkeleton";
// import { useHomePageBlockQuery } from "queries/useHomePageBlockQuery";
import { useCourtAllTimeQuery } from "queries/useCourtAllTimeQuery";
import { commify } from "utils/commify";

function beautifyStatNumber(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1e9) {
    return `${commify((value / 1e9).toFixed(1))}B`;
  } else if (absValue >= 1e6) {
    return `${commify((value / 1e6).toFixed(1))}M`;
  } else if (absValue >= 1e3) {
    return `${commify((value / 1e3).toFixed(1))}K`;
  } else if (absValue < 1 && absValue !== 0) {
    const inverseValue = 1 / absValue;
    return `1 per ${commify(inverseValue.toFixed(0))}`;
  }

  return commify(value.toFixed(0));
}

const StyledCard = styled.div`
  width: auto;
  height: fit-content;
  display: grid;
  gap: 32px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  padding: ${responsiveSize(0, 32)} 0;
  padding-bottom: 0px;

  ${landscapeStyle(
    () => css`
      gap: 16px;
    `
  )}
`;

interface IStat {
  title: string;
  coinId?: number;
  getText: (data: CourtDetailsQuery["court"]) => string;
  getSubtext?: (data: CourtDetailsQuery["court"], coinPrice?: number) => string;
  color: IStatDisplay["color"];
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const stats: IStat[] = [
  {
    title: "Min Stake",
    coinId: 0,
    getText: (data) => formatPNK(data?.minStake),
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.minStake)) * (coinPrice ?? 0)),
    color: "purple",
    icon: MinStake,
  },
  {
    title: "Vote Stake",
    coinId: 0,
    getText: (data) => {
      const stake = BigInt((data?.minStake * data?.alpha) / 1e4);
      return formatPNK(stake);
    },
    getSubtext: (data, coinPrice) => {
      const stake = BigInt((data?.minStake * data?.alpha) / 1e4);
      return formatUSD(Number(formatUnitsWei(stake)) * (coinPrice ?? 0));
    },
    color: "purple",
    icon: VoteStake,
  },
  {
    title: "Active Jurors",
    getText: (data) => data?.numberStakedJurors,
    color: "purple",
    icon: PNKRedistributedIcon,
  },
  {
    title: "PNK Staked",
    coinId: 0,
    getText: (data) => formatPNK(data?.stake),
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.stake)) * (coinPrice ?? 0)),
    color: "purple",
    icon: PNKIcon,
  },
  {
    title: "Cases",
    getText: (data) => data?.numberDisputes,
    color: "orange",
    icon: BalanceIcon,
  },
  {
    title: "In Progress",
    getText: (data) => data?.numberDisputes - data?.numberClosedDisputes,
    color: "orange",
    icon: BalanceIcon,
  },
  {
    title: "ETH paid to Jurors",
    coinId: 1,
    getText: (data) => formatETH(data?.paidETH),
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.paidETH)) * (coinPrice ?? 0)),
    color: "blue",
    icon: EthereumIcon,
  },
  {
    title: "PNK redistributed",
    coinId: 0,
    getText: (data) => formatPNK(data?.paidPNK),
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.paidPNK)) * (coinPrice ?? 0)),
    color: "purple",
    icon: PNKRedistributedIcon,
  },
];

interface IStats {
  title: string;
  coinId?: number;
  getText: any; //(data: CourtDetailsQuery["court"]) => string;
  getSubtext?: any; // (data: CourtDetailsQuery["court"], coinPrice?: number) => string;
  color: IStatDisplay["color"];
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const timeframedStats: IStats[] = [
  {
    title: "ETH Rewards per PNK Staked",
    getText: (data) => {
      const treeExpectedRewardPerPnk = data?.treeExpectedRewardPerPnk;
      return beautifyStatNumber(treeExpectedRewardPerPnk / 1e18);
    },
    color: "orange",
    icon: RewardsPerPnk,
  },
  {
    title: "Cases per PNK Staked",
    getText: (data) => {
      const treeDisputesPerPnk = data?.treeDisputesPerPnk;
      return beautifyStatNumber(treeDisputesPerPnk);
    },
    color: "orange",
    icon: BalanceWithPNKIcon,
  },
  {
    title: "Votes per PNK Staked",
    getText: (data) => {
      const treeVotesPerPnk = data?.treeVotesPerPnk;
      return beautifyStatNumber(treeVotesPerPnk);
    },
    color: "orange",
    icon: VotesPerPNKIcon,
  },
];

const Stats = () => {
  const { id } = useParams();
  const { data } = useCourtDetails(id);
  const courtData = useCourtAllTimeQuery();
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData } = useCoinPrice(coinIds);

  const foundCourt = useMemo(() => {
    if (courtData?.diffCourts) {
      const foundCourt = courtData?.diffCourts.find((c) => c.id === id);
      console.log({ foundCourt });
      return foundCourt;
    } else {
      console.log("Court not found or diffCourts not available");
      return undefined;
    }
  }, [courtData, id]);

  return (
    <>
      <StyledCard>
        {stats.map(({ title, coinId, getText, getSubtext, color, icon }, i) => {
          const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;
          return (
            <StatDisplay
              key={i}
              {...{ title, color, icon }}
              text={data ? getText(data.court) : <StyledSkeleton />}
              subtext={calculateSubtextRender(data?.court, getSubtext, coinPrice)}
            />
          );
        })}
      </StyledCard>
      <hr />
      <StyledCard>
        {timeframedStats.map(({ title, coinId, getText, getSubtext, color, icon }, i) => {
          const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;
          return (
            <StatDisplay
              key={i}
              {...{ title, color, icon }}
              text={foundCourt ? getText(foundCourt) : <StyledSkeleton />}
              subtext={calculateSubtextRender(foundCourt, getSubtext, coinPrice)}
            />
          );
        })}
      </StyledCard>
    </>
  );
};

export default Stats;
