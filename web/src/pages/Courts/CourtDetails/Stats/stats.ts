import styled from "styled-components";

import EthereumVoteIcon from "svgs/icons/ethereum-vote.svg";
import EthereumIcon from "svgs/icons/ethereum.svg";
import BalanceWithHourglassIcon from "svgs/icons/law-balance-hourglass.svg";
import BalanceIcon from "svgs/icons/law-balance.svg";
import MinStake from "svgs/icons/min-stake.svg";
import PNKIcon from "svgs/icons/pnk.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import JurorIcon from "svgs/icons/user.svg";
import VoteStake from "svgs/icons/vote-stake.svg";

import { formatETH, formatPNK, formatUnitsWei, formatUSD } from "utils/format";

import { CourtDetailsQuery } from "queries/useCourtDetails";

import { IStatDisplay } from "components/StatDisplay";

interface IStat {
  title: string;
  coinId?: number;
  getText: (data: CourtDetailsQuery["court"]) => string;
  getSubtext?: (data: CourtDetailsQuery["court"], coinPrice?: number) => string;
  color: IStatDisplay["color"];
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const StyledEthereumVoteIcon = styled(EthereumVoteIcon)`
  height: 32px !important;
`;

const StyledJurorIcon = styled(JurorIcon)`
  height: 15px !important;
`;

const StyledBalanceWithHourglassIcon = styled(BalanceWithHourglassIcon)`
  height: 32px !important;
`;

export const stats: IStat[] = [
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
      const stake = (BigInt(data?.minStake) * BigInt(data?.alpha)) / BigInt(1e4);
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
    getText: (data) => `${formatPNK(data?.effectiveStake)} PNK`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.effectiveStake)) * (coinPrice ?? 0)),
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
