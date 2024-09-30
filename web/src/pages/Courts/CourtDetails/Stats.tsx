import React, { useMemo, useState } from "react";
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
import ChartIcon from "svgs/icons/chart.svg";

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
import { commify } from "utils/commify";
import { CustomAccordion, DropdownSelect } from "@kleros/ui-components-library";
import { useHomePageExtraStats } from "queries/useHomePageExtraStats";

const StyledAccordion = styled(CustomAccordion)`
  width: 100%;
  margin-bottom: 12px;
  > * > button {
    justify-content: unset;
    background-color: ${({ theme }) => theme.whiteBackground} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    color: ${({ theme }) => theme.primaryText} !important;
    > svg {
      fill: ${({ theme }) => theme.primaryText} !important;
    }
  }
  //adds padding to body container
  > * > div > div {
    padding: 0;
  }
`;

function beautifyStatNumber(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1e9) {
    return `${commify((value / 1e9).toFixed(2))}B`;
  } else if (absValue >= 1e6) {
    return `${commify((value / 1e6).toFixed(2))}M`;
  } else if (absValue >= 1e3) {
    return `${commify((value / 1e3).toFixed(0))}K`;
  } else if (absValue < 1 && absValue !== 0) {
    const inverseValue = 1 / absValue;
    return commify(inverseValue.toFixed(0));
  }

  return commify(value.toFixed(0));
}

const TimeDisplayContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const AllTimeContainer = styled(TimeDisplayContainer)`
  padding-top: ${responsiveSize(12, 20)};
`;

const TimeSelectorContainer = styled(TimeDisplayContainer)`
  padding-top: 12px;
`;

const StyledAllTimeText = styled.p`
  color: ${({ theme }) => theme.secondaryText};
  margin: 0;
  font-size: 14px;
`;

const StyledChartIcon = styled(ChartIcon)`
  path {
    fill: ${({ theme }) => theme.primaryText};
  }
`;

const StyledCard = styled.div`
  width: auto;
  height: fit-content;
  display: grid;
  gap: 32px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  padding-top: ${responsiveSize(28, 32)};
  padding-bottom: ${responsiveSize(20, 0)};

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
    title: "PNK for 1 ETH",
    getText: (data) => {
      const treeExpectedRewardPerPnk = data?.treeExpectedRewardPerPnk;
      return beautifyStatNumber(treeExpectedRewardPerPnk / 1e18);
    },
    color: "orange",
    icon: RewardsPerPnk,
  },
  {
    title: "PNK for 1 Vote",
    getText: (data) => {
      const treeVotesPerPnk = data?.treeVotesPerPnk;
      return beautifyStatNumber(treeVotesPerPnk);
    },
    color: "orange",
    icon: VotesPerPNKIcon,
  },
  {
    title: "PNK for 1 Case",
    getText: (data) => {
      const treeDisputesPerPnk = data?.treeDisputesPerPnk;
      return beautifyStatNumber(treeDisputesPerPnk);
    },
    color: "orange",
    icon: BalanceWithPNKIcon,
  },
];

const timeRanges = [
  { value: 7, text: "Last 7 days" },
  { value: 30, text: "Last 30 days" },
  { value: 90, text: "Last 90 days" },
  /* we can uncomment as court creation time increases,
  but it's a bit tricky because this affects every court */
  // { value: 180, text: "Last 180 days" },
  // { value: 365, text: "Last 365 days" },
  { value: "allTime", text: "All Time" },
];

const Stats = () => {
  const { id } = useParams();
  const { data } = useCourtDetails(id);
  const [selectedRange, setSelectedRange] = useState(timeRanges[0].value);
  const timeframedCourtData = useHomePageExtraStats(selectedRange);
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData } = useCoinPrice(coinIds);

  const foundCourt = useMemo(() => {
    if (timeframedCourtData?.diffCourts) {
      const foundCourt = timeframedCourtData?.diffCourts.find((c) => c.id === id);
      console.log({ foundCourt });
      return foundCourt;
    } else {
      console.log("Court not found or diffCourts not available");
      return undefined;
    }
  }, [timeframedCourtData, id]);

  const handleTimeRangeChange = (value: string | number) => {
    setSelectedRange(value);
  };

  return (
    <StyledAccordion
      items={[
        {
          title: "Statistics",
          body: (
            <>
              <AllTimeContainer>
                <StyledChartIcon />
                <StyledAllTimeText>All time</StyledAllTimeText>
              </AllTimeContainer>
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
              <TimeSelectorContainer>
                <StyledChartIcon />
                <StyledAllTimeText>
                  <DropdownSelect
                    smallButton
                    simpleButton
                    items={timeRanges.map((range) => ({
                      value: range.value,
                      text: range.text,
                    }))}
                    defaultValue={selectedRange}
                    callback={handleTimeRangeChange}
                  />
                </StyledAllTimeText>
              </TimeSelectorContainer>
              <StyledCard>
                {timeframedStats.map(({ title, getText, getSubtext, color, icon }, i) => {
                  return (
                    <StatDisplay
                      key={i}
                      {...{ title, color, icon }}
                      text={foundCourt ? getText(foundCourt) : <StyledSkeleton />}
                      subtext={calculateSubtextRender(foundCourt, getSubtext)}
                    />
                  );
                })}
              </StyledCard>
            </>
          ),
        },
      ]}
    ></StyledAccordion>
  );
};

export default Stats;
