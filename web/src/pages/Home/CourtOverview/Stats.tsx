import React from "react";
import styled, { css } from "styled-components";

import { Card } from "@kleros/ui-components-library";

import EthereumIcon from "svgs/icons/ethereum.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import PNKIcon from "svgs/icons/pnk.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import JurorIcon from "svgs/icons/user.svg";

import { CoinIds } from "consts/coingecko";
import { useCoinPrice } from "hooks/useCoinPrice";
import { useHomePageContext, HomePageQuery, HomePageQueryDataPoints } from "hooks/useHomePageContext";
import useIsDesktop from "hooks/useIsDesktop";
import { calculateSubtextRender } from "utils/calculateSubtextRender";
import { formatETH, formatPNK, formatUnitsWei, formatUSD } from "utils/format";
import { isUndefined } from "utils/index";

import { landscapeStyle } from "styles/landscapeStyle";

import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import { StyledSkeleton } from "components/StyledSkeleton";

const StyledCard = styled(Card)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  width: auto;
  height: fit-content;
  gap: 16px 8px;
  padding: 16px;

  ${landscapeStyle(
    () => css`
      padding: 24px;
    `
  )}
`;

export const getLastOrZero = (src: HomePageQuery["counters"], stat: HomePageQueryDataPoints) =>
  src.length > 0 ? src.at(-1)?.[stat] : 0n.toString();

interface IStat {
  title: string;
  coinId?: number;
  getText: (data: HomePageQuery["counters"]) => string;
  getSubtext?: (data: HomePageQuery["counters"], coinPrice?: number) => string;
  color: IStatDisplay["color"];
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const stats: IStat[] = [
  {
    title: "PNK Staked",
    coinId: 0,
    getText: (counters) => formatPNK(getLastOrZero(counters, "stakedPNK")),
    getSubtext: (counters, coinPrice) =>
      formatUSD(Number(formatUnitsWei(getLastOrZero(counters, "stakedPNK"))) * (coinPrice ?? 0)),
    color: "purple",
    icon: PNKIcon,
  },
  {
    title: "ETH Paid",
    coinId: 1,
    getText: (counters) => formatETH(getLastOrZero(counters, "paidETH")),
    getSubtext: (counters, coinPrice) =>
      formatUSD(Number(formatUnitsWei(getLastOrZero(counters, "paidETH"))) * (coinPrice ?? 0)),
    color: "blue",
    icon: EthereumIcon,
  },
  {
    title: "PNK Redistributed",
    coinId: 0,
    getText: (counters) => formatPNK(getLastOrZero(counters, "redistributedPNK")),
    getSubtext: (counters, coinPrice) =>
      formatUSD(Number(formatUnitsWei(getLastOrZero(counters, "redistributedPNK"))) * (coinPrice ?? 0)),
    color: "purple",
    icon: PNKRedistributedIcon,
  },
  {
    title: "Active Jurors",
    getText: (counters) => getLastOrZero(counters, "activeJurors"),
    color: "green",
    icon: JurorIcon,
  },
  {
    title: "Cases",
    getText: (counters) => getLastOrZero(counters, "cases"),
    color: "orange",
    icon: BalanceIcon,
  },
];

const Stats = () => {
  const { data } = useHomePageContext();
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData } = useCoinPrice(coinIds);
  const isDesktop = useIsDesktop();

  return (
    <StyledCard>
      {stats.map(({ title, coinId, getText, getSubtext, color, icon }, i) => {
        const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;

        return (
          <StatDisplay
            key={i}
            {...{ title, color, icon }}
            text={data ? getText(data["counters"]) : <StyledSkeleton />}
            subtext={calculateSubtextRender(data ? data["counters"] : undefined, getSubtext, coinPrice)}
            isSmallDisplay={!isDesktop}
          />
        );
      })}
    </StyledCard>
  );
};

export default Stats;
