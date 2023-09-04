import React from "react";
import styled, { css } from "styled-components";
import { smallScreenStyle } from "styles/smallScreenStyle";
import { useParams } from "react-router-dom";
import { useCourtDetails, CourtDetailsQuery } from "queries/useCourtDetails";
import { useCoinPrice } from "hooks/useCoinPrice";
import { formatETH, formatPNK, formatUnitsWei, formatUSD } from "utils/format";
import { isUndefined } from "utils/index";
import { calculateSubtextRender } from "utils/calculateSubtextRender";
import { CoinIds } from "consts/coingecko";
import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import { StyledSkeleton } from "components/StyledSkeleton";
import BalanceIcon from "svgs/icons/law-balance.svg";
import MinStake from "svgs/icons/min-stake.svg";
import VoteStake from "svgs/icons/vote-stake.svg";
import PNKIcon from "svgs/icons/pnk.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import EthereumIcon from "svgs/icons/ethereum.svg";

const StyledCard = styled.div`
  width: auto;
  height: fit-content;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  padding: calc(0px + (32 - 0) * (min(max(100vw, 375px), 1250px) - 375px) / 875) 0;

  ${smallScreenStyle(
    () => css`
      gap: 32px;
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
    getText: (data) => formatPNK(data?.minStake),
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.minStake)) * (coinPrice ?? 0)),
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
    getText: (data) => data?.numberDisputes,
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

const Stats = () => {
  const { id } = useParams();
  const { data } = useCourtDetails(id);
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData } = useCoinPrice(coinIds);

  return (
    <StyledCard>
      {stats.map(({ title, coinId, getText, getSubtext, color, icon }, i) => {
        const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;
        return (
          <StatDisplay
            key={i}
            {...{ title, color, icon }}
            text={data ? getText(data.court) : <StyledSkeleton />}
            subtext={calculateSubtextRender(data ? data.court : undefined, getSubtext, coinPrice)}
          />
        );
      })}
    </StyledCard>
  );
};

export default Stats;
