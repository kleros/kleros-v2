import React from "react";
import styled, { css } from "styled-components";

import { useParams } from "react-router-dom";

import ChartIcon from "svgs/icons/chart.svg";
import EthereumVoteIcon from "svgs/icons/ethereum-vote.svg";
import EthereumIcon from "svgs/icons/ethereum.svg";
import BalanceWithHourglassIcon from "svgs/icons/law-balance-hourglass.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import MinStake from "svgs/icons/min-stake.svg";
import PNKIcon from "svgs/icons/pnk.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import JurorIcon from "svgs/icons/user.svg";
import VoteStake from "svgs/icons/vote-stake.svg";

import { CoinIds } from "consts/coingecko";
import { useCoinPrice } from "hooks/useCoinPrice";
import { calculateSubtextRender } from "utils/calculateSubtextRender";
import { formatETH, formatPNK, formatUnitsWei, formatUSD } from "utils/format";
import { isUndefined } from "utils/index";

import { useCourtDetails, CourtDetailsQuery } from "queries/useCourtDetails";

import { responsiveSize } from "styles/responsiveSize";

import { Divider } from "components/Divider";
import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import { StyledSkeleton } from "components/StyledSkeleton";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.lightBlue};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.mediumBlue};
  justify-content: center;
`;

const Title = styled.p`
  margin: 0;
  font-weight: 600;
`;

const StyledDivider = styled(Divider)`
  background-color: ${({ theme }) => theme.mediumBlue};
  margin: 12px 0 8px 0;
`;

const TimeDisplayContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const AllTimeContainer = styled(TimeDisplayContainer)`
  padding: ${responsiveSize(12, 16)} 0;
`;

const StyledAllTimeText = styled.p`
  color: ${({ theme }) => theme.primaryText};
  margin: 0;
  font-size: 14px;
`;

const StyledChartIcon = styled(ChartIcon)`
  path {
    fill: ${({ theme }) => theme.primaryText};
  }
`;

const StyledEthereumVoteIcon = styled(EthereumVoteIcon)`
  height: 32px !important;
`;

const StyledJurorIcon = styled(JurorIcon)`
  height: 15px !important;
`;

const StyledBalanceWithHourglassIcon = styled(BalanceWithHourglassIcon)`
  height: 32px !important;
`;

const AccordionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledCard = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px 0;
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
    getText: (data) => `${formatPNK(data?.minStake)} PNK`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.minStake)) * (coinPrice ?? 0)),
    color: "blue",
    icon: MinStake,
  },
  {
    title: "Vote Stake",
    coinId: 0,
    getText: (data) => {
      const stake = BigInt((data?.minStake * data?.alpha) / 1e4);
      return `${formatPNK(stake)} PNK`;
    },
    getSubtext: (data, coinPrice) => {
      const stake = BigInt((data?.minStake * data?.alpha) / 1e4);
      return formatUSD(Number(formatUnitsWei(stake)) * (coinPrice ?? 0));
    },
    color: "blue",
    icon: VoteStake,
  },
  {
    title: "Reward per Vote",
    coinId: 1,
    getText: (data) => {
      const jurorReward = formatUnitsWei(data?.feeForJuror);
      return `${jurorReward} ETH`;
    },
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.feeForJuror)) * (coinPrice ?? 0)),
    color: "blue",
    icon: StyledEthereumVoteIcon,
  },
  {
    title: "PNK Staked",
    coinId: 0,
    getText: (data) => `${formatPNK(data?.stake)} PNK`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.stake)) * (coinPrice ?? 0)),
    color: "green",
    icon: PNKIcon,
  },
  {
    title: "Active Jurors",
    getText: (data) => data?.numberStakedJurors,
    color: "green",
    icon: StyledJurorIcon,
  },
  {
    title: "Cases",
    getText: (data) => data?.numberDisputes,
    color: "green",
    icon: BalanceIcon,
  },
  {
    title: "In Progress",
    getText: (data) => data?.numberDisputes - data?.numberClosedDisputes,
    color: "green",
    icon: StyledBalanceWithHourglassIcon,
  },
  {
    title: "ETH paid",
    coinId: 1,
    getText: (data) => `${formatETH(data?.paidETH)} ETH`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.paidETH)) * (coinPrice ?? 0)),
    color: "purple",
    icon: EthereumIcon,
  },
  {
    title: "PNK redistributed",
    coinId: 0,
    getText: (data) => `${formatPNK(data?.paidPNK)} PNK`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.paidPNK)) * (coinPrice ?? 0)),
    color: "purple",
    icon: PNKRedistributedIcon,
  },
];

const Stats = () => {
  const { id } = useParams();
  const { data } = useCourtDetails(id);
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData } = useCoinPrice(coinIds);

  return (
    <Container>
      {/* <Title>Statistics</Title>
      <StyledDivider /> */}
      <AccordionContainer>
        <div>
          <AllTimeContainer>
            <StyledChartIcon />
            <StyledAllTimeText>Parameters</StyledAllTimeText>
          </AllTimeContainer>
          <StyledCard>
            {stats.slice(0, 3).map(({ title, coinId, getText, getSubtext, color, icon }) => {
              const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;
              return (
                <StatDisplay
                  key={title}
                  {...{ title, color, icon }}
                  text={data ? getText(data.court) : <StyledSkeleton />}
                  subtext={calculateSubtextRender(data?.court, getSubtext, coinPrice)}
                  isSmallDisplay={true}
                />
              );
            })}
          </StyledCard>
          <StyledDivider />
        </div>
        <div>
          <AllTimeContainer>
            <StyledChartIcon />
            <StyledAllTimeText>Activity</StyledAllTimeText>
          </AllTimeContainer>
          <StyledCard>
            {stats.slice(3, 7).map(({ title, coinId, getText, getSubtext, color, icon }) => {
              const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;
              return (
                <StatDisplay
                  key={title}
                  {...{ title, color, icon }}
                  text={data ? getText(data.court) : <StyledSkeleton />}
                  subtext={calculateSubtextRender(data?.court, getSubtext, coinPrice)}
                  isSmallDisplay={true}
                />
              );
            })}
          </StyledCard>
          <StyledDivider />
        </div>
        <div>
          <AllTimeContainer>
            <StyledChartIcon />
            <StyledAllTimeText>Total Rewards</StyledAllTimeText>
          </AllTimeContainer>
          <StyledCard>
            {stats.slice(7, 9).map(({ title, coinId, getText, getSubtext, color, icon }) => {
              const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;
              return (
                <StatDisplay
                  key={title}
                  {...{ title, color, icon }}
                  text={data ? getText(data.court) : <StyledSkeleton />}
                  subtext={calculateSubtextRender(data?.court, getSubtext, coinPrice)}
                  isSmallDisplay={true}
                />
              );
            })}
          </StyledCard>
        </div>
      </AccordionContainer>
    </Container>
  );
};

export default Stats;
