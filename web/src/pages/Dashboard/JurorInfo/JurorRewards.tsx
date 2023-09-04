import React from "react";
import styled from "styled-components";
import { formatUnits, formatEther } from "viem";
import { useAccount } from "wagmi";
import TokenRewards from "./TokenRewards";
import WithHelpTooltip from "../WithHelpTooltip";
import { isUndefined } from "utils/index";
import { CoinIds } from "consts/coingecko";
import { useUserQuery, UserQuery } from "queries/useUser";
import { useCoinPrice } from "hooks/useCoinPrice";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: auto;
`;

const tooltipMsg =
  "Users have an economic interest in serving as jurors in Kleros: " +
  "collecting the Juror Rewards in exchange for their work. Each juror who " +
  "is coherent with the final ruling receive the Juror Rewards composed of " +
  "arbitration fees (ETH) + PNK redistribution between jurors.";

interface IReward {
  token: "ETH" | "PNK";
  coinId: number;
  getAmount: (amount: bigint) => string;
  getValue: (amount: bigint, coinPrice?: number) => string;
}

const rewards: IReward[] = [
  {
    token: "ETH",
    coinId: 1,
    getAmount: (amount) => Number(formatEther(amount)).toFixed(3).toString(),
    getValue: (amount, coinPrice) => (Number(formatEther(amount)) * (coinPrice ?? 0)).toFixed(2).toString(),
  },
  {
    token: "PNK",
    coinId: 0,
    getAmount: (amount) => Number(formatUnits(amount, 18)).toFixed(3).toString(),
    getValue: (amount, coinPrice) => (Number(formatUnits(amount, 18)) * (coinPrice ?? 0)).toFixed(2).toString(),
  },
];

const calculateTotalReward = (coinId: number, data: UserQuery): bigint => {
  const total = data.user?.shifts
    .map((shift) => parseInt(coinId === 0 ? shift.pnkAmount : shift.ethAmount))
    .reduce((acc, curr) => acc + curr, 0);

  return BigInt(total ?? 0);
};

const Coherency: React.FC = () => {
  const { address } = useAccount();
  const { data } = useUserQuery(address?.toLowerCase());
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData } = useCoinPrice(coinIds);

  return (
    <>
      <Container>
        <WithHelpTooltip place="bottom" {...{ tooltipMsg }}>
          <label> Juror Rewards </label>
        </WithHelpTooltip>
        {rewards.map(({ token, coinId, getValue, getAmount }) => {
          const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId]]?.price : undefined;
          const totalReward = data && calculateTotalReward(coinId, data);
          return (
            <TokenRewards
              key={coinId}
              {...{ token }}
              amount={!isUndefined(totalReward) ? getAmount(totalReward) : undefined}
              value={!isUndefined(totalReward) ? getValue(totalReward, coinPrice) : undefined}
            />
          );
        })}
      </Container>
    </>
  );
};

export default Coherency;
