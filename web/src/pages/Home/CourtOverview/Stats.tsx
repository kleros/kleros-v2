import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card } from "@kleros/ui-components-library";
import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import { StyledSkeleton } from "components/StyledSkeleton";
import PNKIcon from "svgs/icons/pnk.svg";
import EthereumIcon from "svgs/icons/ethereum.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import JurorIcon from "svgs/icons/user.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import { formatETH, formatPNK, formatUnitsWei, formatUSD } from "utils/format";
import { isUndefined } from "utils/index";
import { calculateSubtextRender } from "utils/calculateSubtextRender";
import { CoinIds } from "consts/coingecko";
import { useHomePageContext, HomePageQuery, HomePageQueryDataPoints } from "hooks/useHomePageContext";
import { useCoinPrice } from "hooks/useCoinPrice";
import { responsiveSize } from "styles/responsiveSize";

const StyledCard = styled(Card)`
  width: auto;
  height: fit-content;
  gap: 32px;
  padding: ${responsiveSize(16, 30)};
  padding-left: ${responsiveSize(16, 35)};
  padding-bottom: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));

  ${landscapeStyle(
    () => css`
      padding-bottom: 0px;
      gap: 0px;
    `
  )}
`;

const getLastOrZero = (src: HomePageQuery["counters"], stat: HomePageQueryDataPoints) =>
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
    title: "PNK staked",
    coinId: 0,
    getText: (counters) => formatPNK(getLastOrZero(counters, "stakedPNK")),
    getSubtext: (counters, coinPrice) =>
      formatUSD(Number(formatUnitsWei(getLastOrZero(counters, "stakedPNK"))) * (coinPrice ?? 0)),
    color: "purple",
    icon: PNKIcon,
  },
  {
    title: "ETH Paid to jurors",
    coinId: 1,
    getText: (counters) => formatETH(getLastOrZero(counters, "paidETH")),
    getSubtext: (counters, coinPrice) =>
      formatUSD(Number(formatUnitsWei(getLastOrZero(counters, "paidETH"))) * (coinPrice ?? 0)),
    color: "blue",
    icon: EthereumIcon,
  },
  {
    title: "PNK redistributed",
    coinId: 0,
    getText: (counters) => formatPNK(getLastOrZero(counters, "redistributedPNK")),
    getSubtext: (counters, coinPrice) =>
      formatUSD(Number(formatUnitsWei(getLastOrZero(counters, "redistributedPNK"))) * (coinPrice ?? 0)),
    color: "purple",
    icon: PNKRedistributedIcon,
  },
  {
    title: "Active jurors",
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
          />
        );
      })}
    </StyledCard>
  );
};

export default Stats;
