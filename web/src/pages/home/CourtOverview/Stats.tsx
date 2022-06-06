import React from "react";
import styled from "styled-components";
import { utils } from "ethers";
import { Card } from "@kleros/ui-components-library";
import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import PNKIcon from "svgs/icons/pnk.svg";
import EthereumIcon from "svgs/icons/ethereum.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import JurorIcon from "svgs/icons/user.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import { useHomePageContext, HomePageQuery } from "hooks/useHomePageContext";

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

interface IStat {
  title: string;
  getText: (data: HomePageQuery) => string;
  getSubtext: (data: HomePageQuery) => string;
  color: IStatDisplay["color"];
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const stats: IStat[] = [
  {
    title: "PNK staked",
    getText: (data) =>
      utils.commify(
        utils.formatUnits(data?.pnkstakedDataPoints.at(-1)?.value, 18)
      ),
    getSubtext: () => "$ 3 000 000",
    color: "purple",
    icon: PNKIcon,
  },
  {
    title: "ETH Paid to jurors",
    getText: (data) =>
      utils.commify(utils.formatEther(data?.ethpaidDataPoints.at(-1)?.value)),
    getSubtext: () => "$ 3,000,000",
    color: "blue",
    icon: EthereumIcon,
  },
  {
    title: "PNK redistributed",
    getText: (data) =>
      utils.commify(
        utils.formatUnits(data?.pnkredistributedDataPoints.at(-1)?.value, 18)
      ),
    getSubtext: () => "$ 3,000,000",
    color: "purple",
    icon: PNKRedistributedIcon,
  },
  {
    title: "Active jurors",
    getText: (data) => data?.activeJurorsDataPoints.at(-1)?.value,
    getSubtext: () => "$ 3,000,000",
    color: "green",
    icon: JurorIcon,
  },
  {
    title: "Cases",
    getText: (data) => data?.casesDataPoints.at(-1)?.value,
    getSubtext: () => "$ 3,000,000",
    color: "orange",
    icon: BalanceIcon,
  },
];

const Stats = () => {
  const { data } = useHomePageContext();
  return (
    <StyledCard>
      {stats.map(({ title, getText, getSubtext, color, icon }, i) => {
        return (
          <StatDisplay
            key={i}
            {...{ title, color, icon }}
            text={data ? getText(data) : "Fetching..."}
            subtext={data ? getSubtext(data) : "Fetching..."}
          />
        );
      })}
    </StyledCard>
  );
};

export default Stats;
