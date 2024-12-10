import React, { useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { useParams } from "react-router-dom";
import { Accordion, DropdownSelect } from "@kleros/ui-components-library";

import EthereumIcon from "svgs/icons/ethereum.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import MinStake from "svgs/icons/min-stake.svg";
import VotesPerPNKIcon from "svgs/icons/votes-per-pnk.svg";
import PNKIcon from "svgs/icons/pnk.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import VoteStake from "svgs/icons/vote-stake.svg";
import PNKUSDIcon from "svgs/icons/pnk-usd.svg";
import PNKETHIcon from "svgs/icons/pnk-eth.svg";
import ChartIcon from "svgs/icons/chart.svg";

import { CoinIds } from "consts/coingecko";

import { useCoinPrice } from "hooks/useCoinPrice";
import { useCourtDetails, CourtDetailsQuery } from "queries/useCourtDetails";
import { useHomePageExtraStats } from "queries/useHomePageExtraStats";

import { calculateSubtextRender } from "utils/calculateSubtextRender";
import { formatETH, formatPNK, formatUnitsWei, formatUSD } from "utils/format";
import { isUndefined } from "utils/index";
import { beautifyStatNumber, unbeautifyStatNumber } from "utils/beautifyStatNumber";

import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import { StyledSkeleton } from "components/StyledSkeleton";
import WithHelpTooltip from "components/WithHelpTooltip";
import Info from "./Info";

const StyledAccordion = styled(Accordion)`
  width: 100%;
  margin-top: ${responsiveSize(24, 32)};
  > * > button {
    justify-content: unset;
    background-color: ${({ theme }) => theme.whiteBackground} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    > svg {
      fill: ${({ theme }) => theme.primaryText} !important;
    }
    > p {
      color: ${({ theme }) => theme.primaryText};
    }
  }
  //adds padding to body container
  > * > div > div {
    padding: 0;
  }
`;

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
  padding-bottom: 12px;
  flex-wrap: wrap;
`;

const StyledAllTimeText = styled.p`
  color: ${({ theme }) => theme.primaryText};
  margin: 0;
  font-size: 14px;
  font-weight: 600;
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
  grid-template-columns: repeat(auto-fit, minmax(156px, 1fr));
  padding-top: ${responsiveSize(28, 32)};
  padding-bottom: ${responsiveSize(20, 0)};

  ${landscapeStyle(
    () => css`
      gap: 16px;
    `
  )}
`;

const StyledDropdownSelect = styled(DropdownSelect)`
  margin-right: 16px;
  small {
    color: ${({ theme }) => theme.primaryText};
  }
  svg {
    fill: ${({ theme }) => theme.primaryText};
  }
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
    title: "Reward per Vote",
    coinId: 1,
    getText: (data) => {
      const jurorReward = formatUnitsWei(data?.feeForJuror);
      return jurorReward;
    },
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.feeForJuror)) * (coinPrice ?? 0)),
    color: "purple",
    icon: EthereumIcon,
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
    title: "Total ETH paid",
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

interface ITimeframedStatData {
  treeExpectedRewardPerPnk: number;
  treeVotesPerPnk: number;
  treeDisputesPerPnk: number;
}

interface ITimeframedStat {
  title: string | React.ReactNode;
  coinId?: number;
  getText: (data: ITimeframedStatData) => string;
  getSubtext?: (data: CourtDetailsQuery["court"], coinPrice?: number) => string;
  color: IStatDisplay["color"];
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const timeRanges = [
  { value: 30, text: "Last 30 days" },
  { value: 90, text: "Last 90 days" },
  { value: 180, text: "Last 180 days" },
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
    return timeframedCourtData?.data?.courts?.find((c) => c.id === id);
  }, [timeframedCourtData, id]);

  const handleTimeRangeChange = (value: string | number) => {
    setSelectedRange(value);
  };

  const timeframedStats: ITimeframedStat[] = [
    {
      title: (
        <WithHelpTooltip place="top" tooltipMsg="Amount of PNK you need to stake to get 1 vote.">
          PNK for 1 Vote
        </WithHelpTooltip>
      ),
      coinId: 0,
      getText: (data) => beautifyStatNumber(data?.treeVotesPerPnk, true),
      getSubtext: (data, coinPrice) =>
        formatUSD(unbeautifyStatNumber(beautifyStatNumber(data?.treeVotesPerPnk, true)) * (coinPrice ?? 0)),
      color: "orange",
      icon: VotesPerPNKIcon,
    },
    {
      title: (
        <WithHelpTooltip place="top" tooltipMsg="Amount of PNK you need to stake to earn 1 USD in rewards.">
          PNK for 1 USD
        </WithHelpTooltip>
      ),
      coinId: 0,
      getText: (data) => {
        const treeExpectedRewardPerPnk = data?.treeExpectedRewardPerPnk;
        const ethPriceUSD = pricesData ? pricesData[CoinIds.ETH]?.price : undefined;
        if (!ethPriceUSD || !treeExpectedRewardPerPnk) return "N/A";
        const pnkNeeded = treeExpectedRewardPerPnk * ethPriceUSD;
        return beautifyStatNumber(pnkNeeded, true);
      },
      getSubtext: (data, coinPrice) => {
        const treeExpectedRewardPerPnk = data?.treeExpectedRewardPerPnk;
        const ethPriceUSD = pricesData ? pricesData[CoinIds.ETH]?.price : undefined;
        if (!ethPriceUSD || !treeExpectedRewardPerPnk) return "N/A";
        const pnkNeeded = treeExpectedRewardPerPnk * ethPriceUSD;
        return formatUSD(unbeautifyStatNumber(beautifyStatNumber(pnkNeeded, true)) * (coinPrice ?? 0));
      },
      color: "purple",
      icon: PNKUSDIcon,
    },
    {
      title: (
        <WithHelpTooltip place="top" tooltipMsg="Amount of PNK you need to stake to earn 1 ETH in rewards.">
          PNK for 1 ETH
        </WithHelpTooltip>
      ),
      coinId: 0,
      getText: (data) => {
        const treeExpectedRewardPerPnk = data?.treeExpectedRewardPerPnk;
        if (!treeExpectedRewardPerPnk) return "N/A";
        const pnkNeeded = treeExpectedRewardPerPnk;
        return beautifyStatNumber(pnkNeeded, true);
      },
      getSubtext: (data, coinPrice) => {
        const treeExpectedRewardPerPnk = data?.treeExpectedRewardPerPnk;
        if (!treeExpectedRewardPerPnk) return "N/A";
        const pnkNeeded = treeExpectedRewardPerPnk;
        return formatUSD(unbeautifyStatNumber(beautifyStatNumber(pnkNeeded, true)) * (coinPrice ?? 0));
      },
      color: "blue",
      icon: PNKETHIcon,
    },
  ];

  return (
    <StyledAccordion
      defaultExpanded={0}
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
                {stats.map(({ title, coinId, getText, getSubtext, color, icon }) => {
                  const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;
                  return (
                    <StatDisplay
                      key={title}
                      {...{ title, color, icon }}
                      text={data ? getText(data.court) : <StyledSkeleton />}
                      subtext={calculateSubtextRender(data?.court, getSubtext, coinPrice)}
                    />
                  );
                })}
              </StyledCard>
              <TimeSelectorContainer>
                <StyledChartIcon />
                <StyledDropdownSelect
                  smallButton
                  simpleButton
                  items={timeRanges.map((range) => ({
                    value: range.value,
                    text: range.text,
                  }))}
                  defaultValue={selectedRange}
                  callback={handleTimeRangeChange}
                />
              </TimeSelectorContainer>
              <Info />
              <StyledCard>
                {timeframedStats.map(({ title, coinId, getText, getSubtext, color, icon }) => {
                  const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;
                  return (
                    <StatDisplay
                      key={title}
                      {...{ title, color, icon }}
                      text={foundCourt ? getText(foundCourt) : <StyledSkeleton />}
                      subtext={calculateSubtextRender(foundCourt, getSubtext, coinPrice)}
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
