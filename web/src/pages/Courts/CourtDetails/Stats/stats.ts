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
    getText: (data) => `${formatPNK(BigInt(data?.minStake ?? 0))} PNK`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(BigInt(data?.minStake ?? 0))) * (coinPrice ?? 0)),
    color: "blue",
    icon: MinStake,
  },
  {
    title: t("stats.vote_stake"),
    coinId: 0,
    getText: (data) => {
      const stake = BigInt((BigInt(data?.minStake ?? 0) * BigInt(data?.alpha ?? 0)) / BigInt(1e4));
      return `${formatPNK(stake)} PNK`;
    },
    getSubtext: (data, coinPrice) => {
      const stake = (BigInt(data?.minStake ?? 0) * BigInt(data?.alpha ?? 0)) / BigInt(1e4);
      return formatUSD(Number(formatUnitsWei(stake)) * (coinPrice ?? 0));
    },
    color: "blue",
    icon: VoteStake,
  },
  {
    title: t("stats.reward_per_vote"),
    coinId: 1,
    getText: (data) => {
      const jurorReward = formatUnitsWei(BigInt(data?.feeForJuror ?? 0));
      return `${jurorReward} ETH`;
    },
    getSubtext: (data, coinPrice) =>
      formatUSD(Number(formatUnitsWei(BigInt(data?.feeForJuror ?? 0))) * (coinPrice ?? 0)),
    color: "blue",
    icon: StyledEthereumVoteIcon,
  },
  {
    title: t("stats.pnk_staked"),
    coinId: 0,
    getText: (data) => `${formatPNK(BigInt(data?.effectiveStake ?? 0))} PNK`,
    getSubtext: (data, coinPrice) =>
      formatUSD(Number(formatUnitsWei(BigInt(data?.effectiveStake ?? 0))) * (coinPrice ?? 0)),
    color: "green",
    icon: PNKIcon,
  },
  {
    title: t("stats.active_jurors"),
    getText: (data) => data?.effectiveNumberStakedJurors ?? "",
    color: "green",
    icon: StyledJurorIcon,
  },
  {
    title: t("stats.cases"),
    getText: (data) => data?.numberDisputes ?? "",
    color: "green",
    icon: BalanceIcon,
  },
  {
    title: t("filters.in_progress"),
    getText: (data) =>
      (Number(BigInt(data?.numberDisputes ?? 0)) - Number(BigInt(data?.numberClosedDisputes ?? 0))).toString(),
    color: "green",
    icon: StyledBalanceWithHourglassIcon,
  },
  {
    title: t("stats.eth_paid"),
    coinId: 1,
    getText: (data) => `${formatETH(BigInt(data?.paidETH ?? 0))} ETH`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(BigInt(data?.paidETH ?? 0))) * (coinPrice ?? 0)),
    color: "purple",
    icon: EthereumIcon,
  },
  {
    title: t("stats.pnk_redistributed"),
    coinId: 0,
    getText: (data) => `${formatPNK(BigInt(data?.paidPNK ?? 0))} PNK`,
    getSubtext: (data, coinPrice) => formatUSD(Number(formatUnitsWei(BigInt(data?.paidPNK ?? 0))) * (coinPrice ?? 0)),
    color: "purple",
    icon: PNKRedistributedIcon,
  },
];
