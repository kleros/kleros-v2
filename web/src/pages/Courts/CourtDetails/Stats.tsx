import React from "react";
import styled from "styled-components";
import { formatUnits, formatEther } from "viem";
import { useParams } from "react-router-dom";
import { useCourtDetails, CourtDetailsQuery } from "queries/useCourtDetails";
import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import EthereumIcon from "svgs/icons/ethereum.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import JurorIcon from "svgs/icons/user.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import MinStake from "svgs/icons/min-stake.svg";
import { commify } from "utils/commify";

const StyledCard = styled.div`
  width: auto;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
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
    getText: (data) => commify(formatUnits(data?.minStake, 18)),
    getSubtext: (data) => (parseInt(formatUnits(data?.minStake, 18)) * 0.029).toFixed(2).toString() + "$",
    color: "purple",
    icon: MinStake,
  },
  {
    title: "Vote Stake",
    getText: (data) => commify(formatUnits(data?.minStake, 18)),
    getSubtext: (data) => (parseInt(formatUnits(data?.minStake, 18)) * 0.029).toFixed(2).toString() + "$",
    color: "blue",
    icon: EthereumIcon,
  },
  {
    title: "Active Jurors",
    getText: (data) => data?.numberStakedJurors,
    getSubtext: () => "",
    color: "purple",
    icon: PNKRedistributedIcon,
  },
  {
    title: "PNK Staked",
    getText: (data) => commify(formatUnits(data?.stake, 18)),
    getSubtext: (data) => (parseInt(formatUnits(data?.stake, 18)) * 0.029).toFixed(2).toString() + "$",
    color: "green",
    icon: JurorIcon,
  },
  {
    title: "Cases",
    getText: (data) => data?.numberDisputes,
    getSubtext: () => "",
    color: "orange",
    icon: BalanceIcon,
  },
  {
    title: "In Progress",
    getText: (data) => data?.numberDisputes,
    getSubtext: () => "",
    color: "orange",
    icon: BalanceIcon,
  },
  {
    title: "ETH paid to Jurors",
    getText: (data) => commify(formatEther(data?.paidETH)),
    getSubtext: (data) => (parseInt(formatUnits(data?.paidETH, 18)) * 1600).toFixed(2).toString() + "$",
    color: "orange",
    icon: BalanceIcon,
  },
  {
    title: "PNK redistributed",
    getText: (data) => commify(formatUnits(data?.paidPNK, 18)),
    getSubtext: (data) => (parseInt(formatUnits(data?.paidPNK, 18)) * 0.029).toFixed(2).toString() + "$",
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
