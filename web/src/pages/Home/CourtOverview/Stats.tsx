import React from "react";
import styled from "styled-components";
import { utils, BigNumber } from "ethers";
import { Card } from "@kleros/ui-components-library";
import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import PNKIcon from "svgs/icons/pnk.svg";
import EthereumIcon from "svgs/icons/ethereum.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import JurorIcon from "svgs/icons/user.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import {
  useHomePageContext,
  HomePageQuery,
  HomePageQueryDataPoints,
} from "hooks/useHomePageContext";

const StyledCard = styled(Card)`
  width: auto;
  height: fit-content;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex-wrap: wrap;
`;

const getLastOrZero = (
  src: HomePageQuery["counters"],
  stat: HomePageQueryDataPoints
) => (src.length > 0 ? src.at(-1)?.[stat] : BigNumber.from(0).toString());

interface IStat {
  title: string;
  getText: (data: HomePageQuery["counters"]) => string;
  getSubtext: (data: HomePageQuery["counters"]) => string;
  color: IStatDisplay["color"];
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const stats: IStat[] = [
  {
    title: "PNK staked",
    getText: (counters) =>
      utils.commify(
        utils.formatUnits(getLastOrZero(counters, "stakedPNK"), 18)
      ),
    getSubtext: (counters) =>
      (
        parseInt(utils.formatUnits(getLastOrZero(counters, "stakedPNK"))) *
        0.029
      )
        .toFixed(2)
        .toString() + "$",
    color: "purple",
    icon: PNKIcon,
  },
  {
    title: "ETH Paid to jurors",
    getText: (counters) =>
      utils.commify(utils.formatEther(getLastOrZero(counters, "paidETH"))),
    getSubtext: (counters) =>
      (parseInt(utils.formatUnits(getLastOrZero(counters, "paidETH"))) * 1650)
        .toFixed(2)
        .toString() + "$",
    color: "blue",
    icon: EthereumIcon,
  },
  {
    title: "PNK redistributed",
    getText: (counters) =>
      utils.commify(
        utils.formatUnits(getLastOrZero(counters, "redistributedPNK"), 18)
      ),
    getSubtext: (counters) =>
      (
        parseInt(
          utils.formatUnits(getLastOrZero(counters, "redistributedPNK"))
        ) * 0.029
      )
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

const Stats = () => {
  const { data } = useHomePageContext();
  return (
    <StyledCard>
      {stats.map(({ title, getText, getSubtext, color, icon }, i) => (
        <StatDisplay
          key={i}
          {...{ title, color, icon }}
          text={data ? getText(data["counters"]) : "Fetching..."}
          subtext={data ? getSubtext(data["counters"]) : "Fetching..."}
        />
      ))}
    </StyledCard>
  );
};

export default Stats;
