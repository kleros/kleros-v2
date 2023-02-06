import React from "react";
import styled from "styled-components";
import { utils } from "ethers";
import { useParams } from "react-router-dom";
import { useCourtDetails, CourtDetailsQuery } from "queries/useCourtDetails";
import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import PNKIcon from "svgs/icons/pnk.svg";
import EthereumIcon from "svgs/icons/ethereum.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import JurorIcon from "svgs/icons/user.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import MinStake from "svgs/icons/min-stake.svg";

const StyledCard = styled.div`
  width: auto;
  height: fit-content;
  margin: 48px 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 32px;
`;

interface IStat {
  title: string;
  getText: (data: CourtDetailsQuery["court"]) => string;
  getSubtext: (data: CourtDetailsQuery["court"]) => string;
  color: IStatDisplay["color"];
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const stats: IStat[] = [
  {
    title: "Min Stake",
    getText: (data) => utils.commify(utils.formatUnits(data?.minStake, 18)),
    getSubtext: () => "$ 3 000 000",
    color: "purple",
    icon: MinStake,
  },
  {
    title: "Vote Stake",
    getText: (data) => utils.commify(utils.formatUnits(data?.minStake, 18)),
    getSubtext: () => "$ 3,000,000",
    color: "blue",
    icon: EthereumIcon,
  },
  {
    title: "Active Jurors",
    getText: (data) => data?.numberStakedJurors,
    getSubtext: () => "$ 3,000,000",
    color: "purple",
    icon: PNKRedistributedIcon,
  },
  {
    title: "PNK Staked",
    getText: (data) => utils.commify(utils.formatUnits(data?.stake, 18)),
    getSubtext: () => "$ 3,000,000",
    color: "green",
    icon: JurorIcon,
  },
  {
    title: "Cases",
    getText: (data) => data?.numberDisputes,
    getSubtext: () => "$ 3,000,000",
    color: "orange",
    icon: BalanceIcon,
  },
  {
    title: "In Progress",
    getText: (data) => data?.numberDisputes,
    getSubtext: () => "$ 3,000,000",
    color: "orange",
    icon: BalanceIcon,
  },
  {
    title: "ETH paid to Jurors",
    getText: (data) => utils.commify(utils.formatEther(data?.paidETH)),
    getSubtext: () => "$ 3,000,000",
    color: "orange",
    icon: BalanceIcon,
  },
  {
    title: "PNK redistributed",
    getText: (data) => utils.commify(utils.formatUnits(data?.paidPNK, 18)),
    getSubtext: () => "$ 3,000,000",
    color: "orange",
    icon: BalanceIcon,
  },
];

const Stats = () => {
  const { id } = useParams();
  const { data } = useCourtDetails(id);
  return (
    <StyledCard>
      {stats.map(({ title, getText, getSubtext, color, icon }, i) => (
        <StatDisplay
          key={i}
          {...{ title, color, icon }}
          text={data ? getText(data.court) : "Fetching..."}
          subtext={data ? getSubtext(data.court) : "Fetching..."}
        />
      ))}
    </StyledCard>
  );
};

export default Stats;
