import React from "react";
import styled from "styled-components";
import { formatEther, formatUnits } from "viem";
import { Card } from "@kleros/ui-components-library";
import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import PNKIcon from "svgs/icons/pnk.svg";
import EthereumIcon from "svgs/icons/ethereum.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import JurorIcon from "svgs/icons/user.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import { KLEROS_CONTRACT_ADDRESS, WETH_CONTRACT_ADDRESS } from "src/consts/index";
import { commify } from "utils/commify";
import { isUndefined } from "utils/index";
import { useHomePageContext, HomePageQuery, HomePageQueryDataPoints } from "hooks/useHomePageContext";
import { useCoinPrice } from "hooks/useCoinPrice";

const StyledCard = styled(Card)`
  width: auto;
  height: fit-content;
  padding: 16px;
  display: grid;
  gap: 32px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const getLastOrZero = (src: HomePageQuery["counters"], stat: HomePageQueryDataPoints) =>
  src.length > 0 ? src.at(-1)?.[stat] : 0n.toString();

interface IStat {
  title: string;
  coinId?: number;
  getText: (data: HomePageQuery["counters"]) => string;
  getSubtext: (data: HomePageQuery["counters"], coinPrice?: number) => string;
  color: IStatDisplay["color"];
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const stats: IStat[] = [
  {
    title: "PNK staked",
    coinId: 0,
    getText: (counters) => commify(Number(formatUnits(getLastOrZero(counters, "stakedPNK"), 18)).toFixed(0)),
    getSubtext: (counters, coinPrice) =>
      (parseInt(formatUnits(getLastOrZero(counters, "stakedPNK"), 18)) * (coinPrice ?? 0)).toFixed(2).toString() + "$",
    color: "purple",
    icon: PNKIcon,
  },
  {
    title: "ETH Paid to jurors",
    coinId: 1,
    getText: (counters) => commify(Number(formatEther(getLastOrZero(counters, "paidETH"))).toFixed(4)),
    getSubtext: (counters, coinPrice) =>
      (Number(formatUnits(getLastOrZero(counters, "paidETH"), 18)) * (coinPrice ?? 0)).toFixed(2).toString() + "$",
    color: "blue",
    icon: EthereumIcon,
  },
  {
    title: "PNK redistributed",
    coinId: 0,
    getText: (counters) => commify(Number(formatUnits(getLastOrZero(counters, "redistributedPNK"), 18)).toFixed(0)),
    getSubtext: (counters, coinPrice) =>
      (parseInt(formatUnits(getLastOrZero(counters, "redistributedPNK"), 18)) * (coinPrice ?? 0))
        .toFixed(2)
        .toString() + "$",
    color: "purple",
    icon: PNKRedistributedIcon,
  },
  {
    title: "Active jurors",
    getText: (counters) => getLastOrZero(counters, "activeJurors"),
    getSubtext: () => "",
    color: "green",
    icon: JurorIcon,
  },
  {
    title: "Cases",
    getText: (counters) => getLastOrZero(counters, "cases"),
    getSubtext: () => "",
    color: "orange",
    icon: BalanceIcon,
  },
];

const coinIdToAddress = {
  0: KLEROS_CONTRACT_ADDRESS,
  1: WETH_CONTRACT_ADDRESS,
};

const Stats = () => {
  const { data } = useHomePageContext();
  const { prices: pricesData } = useCoinPrice([KLEROS_CONTRACT_ADDRESS, WETH_CONTRACT_ADDRESS]);
  return (
    <StyledCard>
      {stats.map(({ title, coinId, getText, getSubtext, color, icon }, i) => {
        const coinPrice = !isUndefined(pricesData) ? pricesData[coinIdToAddress[coinId!]]?.price : undefined;
        return (
          <StatDisplay
            key={i}
            {...{ title, color, icon }}
            text={data ? getText(data["counters"]) : "Fetching..."}
            subtext={data ? getSubtext(data["counters"], coinPrice) : "Fetching..."}
          />
        );
      })}
    </StyledCard>
  );
};

export default Stats;
