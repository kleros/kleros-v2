import React from "react";
import styled from "styled-components";
import { formatUnits, formatEther } from "viem";
import { useParams } from "react-router-dom";
import { useCourtDetails, CourtDetailsQuery } from "queries/useCourtDetails";
import { KLEROS_CONTRACT_ADDRESS, WETH_CONTRACT_ADDRESS } from "src/consts/index";
import StatDisplay, { IStatDisplay } from "components/StatDisplay";
import BalanceIcon from "svgs/icons/law-balance.svg";
import MinStake from "svgs/icons/min-stake.svg";
import { commify } from "utils/commify";
import VoteStake from "svgs/icons/vote-stake.svg";
import PNKIcon from "svgs/icons/pnk.svg";
import PNKRedistributedIcon from "svgs/icons/redistributed-pnk.svg";
import EthereumIcon from "svgs/icons/ethereum.svg";
import { useCoinPrice } from "hooks/useCoinPrice";
import { isUndefined } from "~src/utils";

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
  coinId?: number;
  getText: (data: CourtDetailsQuery["court"]) => string;
  getSubtext: (data: CourtDetailsQuery["court"], coinPrice?: number) => string;
  color: IStatDisplay["color"];
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const stats: IStat[] = [
  {
    title: "Min Stake",
    coinId: 0,
    getText: (data) => commify(formatUnits(data?.minStake, 18)),
    getSubtext: (data, coinPrice) =>
      (parseInt(formatUnits(data?.minStake, 18)) * (coinPrice ?? 0)).toFixed(2).toString() + "$",
    color: "purple",
    icon: MinStake,
  },
  {
    title: "Vote Stake",
    coinId: 0,
    getText: (data) => commify(formatUnits(data?.minStake, 18)),
    getSubtext: (data, coinPrice) =>
      (parseInt(formatUnits(data?.minStake, 18)) * (coinPrice ?? 0)).toFixed(2).toString() + "$",
    color: "purple",
    icon: VoteStake,
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
    coinId: 0,
    getText: (data) => commify(formatUnits(data?.stake, 18)),
    getSubtext: (data, coinPrice) =>
      (parseInt(formatUnits(data?.stake, 18)) * (coinPrice ?? 0)).toFixed(2).toString() + "$",
    color: "purple",
    icon: PNKIcon,
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
    coinId: 1,
    getText: (data) => commify(formatEther(BigInt(data?.paidETH))),
    getSubtext: (data, coinPrice) =>
      (Number(formatUnits(data?.paidETH, 18)) * (coinPrice ?? 0)).toFixed(2).toString() + "$",
    color: "blue",
    icon: EthereumIcon,
  },
  {
    title: "PNK redistributed",
    coinId: 0,
    getText: (data) => commify(formatUnits(data?.paidPNK, 18)),
    getSubtext: (data, coinPrice) =>
      (parseInt(formatUnits(data?.paidPNK, 18)) * (coinPrice ?? 0)).toFixed(2).toString() + "$",
    color: "purple",
    icon: PNKRedistributedIcon,
  },
];

const Stats = () => {
  const { id } = useParams();
  const { data } = useCourtDetails(id);
  const { prices: pricesData } = useCoinPrice([KLEROS_CONTRACT_ADDRESS, WETH_CONTRACT_ADDRESS]);

  return (
    <StyledCard>
      {stats.map(({ title, coinId, getText, getSubtext, color, icon }, i) => {
        let coinPrice;
        if (!isUndefined(pricesData)) {
          if (coinId === 0) {
            coinPrice = pricesData[KLEROS_CONTRACT_ADDRESS].price;
          } else if (coinId === 1) {
            coinPrice = pricesData[WETH_CONTRACT_ADDRESS].price;
          }
        }
        return (
          <StatDisplay
            key={i}
            {...{ title, color, icon }}
            text={data ? getText(data.court) : "Fetching..."}
            subtext={data ? getSubtext(data.court, coinPrice) : "Fetching..."}
          />
        );
      })}
    </StyledCard>
  );
};

export default Stats;
