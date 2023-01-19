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
  gap: 32px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const getLastOrZero = (src: HomePageQueryDataPoints) =>
  src?.length > 0 ? src.at(-1)?.value : BigNumber.from(0).toString();

interface IStat {
  title: string;
  getText: (counters: HomePageQuery["counters"]) => string;
  getSubtext: (counters: HomePageQuery["counters"]) => string;
  color: IStatDisplay["color"];
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const stats: IStat[] = [
  {
    title: "PNK staked",
    getText: ({ stakedPNK }) =>
      utils.commify(utils.formatUnits(getLastOrZero(stakedPNK), 18)),
    getSubtext: () => "$ 3 000 000",
    color: "purple",
    icon: PNKIcon,
  },
  {
    title: "ETH Paid to jurors",
    getText: ({ paidETH }) =>
      utils.commify(utils.formatEther(getLastOrZero(paidETH))),
    getSubtext: () => "$ 3,000,000",
    color: "blue",
    icon: EthereumIcon,
  },
  {
    title: "PNK redistributed",
    getText: ({ redistributedPNK }) =>
      utils.commify(utils.formatUnits(getLastOrZero(redistributedPNK), 18)),
    getSubtext: () => "$ 3,000,000",
    color: "purple",
    icon: PNKRedistributedIcon,
  },
  {
    title: "Active jurors",
    getText: ({ activeJurors }) => getLastOrZero(activeJurors),
    getSubtext: () => "$ 3,000,000",
    color: "green",
    icon: JurorIcon,
  },
  {
    title: "Cases",
    getText: ({ cases }) => getLastOrZero(cases),
    getSubtext: () => "$ 3,000,000",
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
          text={data ? getText(data.counters) : "Fetching..."}
          subtext={data ? getSubtext(data.counters) : "Fetching..."}
        />
      ))}
    </StyledCard>
  );
};

export default Stats;
