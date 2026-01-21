import styled from "styled-components";

import { TFunction } from "i18next";

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

export const getStats = (t: TFunction): IStat[] => [
  {
    title: t("stats.min_stake"),
    coinId: 0,
    getText: (data) => `${formatPNK(data?.minStake)} PNK`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.minStake)) * (coinPrice ?? 0)),
    color: "blue",
    icon: MinStake,
  },
  {
    title: t("stats.vote_stake"),
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
    title: t("stats.reward_per_vote"),
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
    title: t("stats.pnk_staked"),
    coinId: 0,
    getText: (data) => `${formatPNK(data?.effectiveStake)} PNK`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.effectiveStake)) * (coinPrice ?? 0)),
    color: "green",
    icon: PNKIcon,
  },
  {
    title: t("stats.active_jurors"),
    getText: (data) => data?.effectiveNumberStakedJurors,
    color: "green",
    icon: StyledJurorIcon,
  },
  {
    title: t("stats.cases"),
    getText: (data) => data?.numberDisputes,
    color: "green",
    icon: BalanceIcon,
  },
  {
    title: t("filters.in_progress"),
    getText: (data) => data?.numberDisputes - data?.numberClosedDisputes,
    color: "green",
    icon: StyledBalanceWithHourglassIcon,
  },
  {
    title: t("stats.eth_paid"),
    coinId: 1,
    getText: (data) => `${formatETH(data?.paidETH)} ETH`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.paidETH)) * (coinPrice ?? 0)),
    color: "purple",
    icon: EthereumIcon,
  },
  {
    title: t("stats.pnk_redistributed"),
    coinId: 0,
    getText: (data) => `${formatPNK(data?.paidPNK)} PNK`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(data?.paidPNK)) * (coinPrice ?? 0)),
    color: "purple",
    icon: PNKRedistributedIcon,
  },
];
