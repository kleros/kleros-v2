import React from "react";
import styled from "styled-components";
import { formatUnits, formatEther } from "viem";
import { useAccount } from "wagmi";
import { KLEROS_CONTRACT_ADDRESS, WETH_CONTRACT_ADDRESS } from "src/consts/index";
import TokenRewards from "./TokenRewards";
import WithHelpTooltip from "../WithHelpTooltip";
import { isUndefined } from "utils/index";
import { useUserQuery, UserQuery } from "queries/useUser";
import { useCoinPrice } from "hooks/useCoinPrice";

interface IReward {
  token: "ETH" | "PNK";
  coinId: number;
  getAmount: (amount: bigint) => string;
  getValue: (amount: bigint, coinPrice?: number) => string;
}
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const tooltipMsg =
  "Users have an economic interest in serving as jurors in Kleros: " +
  "collecting the Juror Rewards in exchange for their work. Each juror who " +
  "is coherent with the final ruling receive the Juror Rewards composed of " +
  "arbitration fees (ETH) + PNK redistribution between jurors.";

const coinIdToAddress = {
  0: KLEROS_CONTRACT_ADDRESS,
  1: WETH_CONTRACT_ADDRESS,
};

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
    .map((shift) => parseInt(coinId === 0 ? shift.tokenAmount : shift.ethAmount))
    .reduce((acc, curr) => acc + curr, 0);

  return BigInt(total ?? 0);
};

const Coherency: React.FC = () => {
  const { address } = useAccount();
  const { data } = useUserQuery(address?.toLowerCase());
  const { prices: pricesData } = useCoinPrice([KLEROS_CONTRACT_ADDRESS, WETH_CONTRACT_ADDRESS]);

  return (
    <>
      {!isUndefined(data) && (
        <Container>
          <WithHelpTooltip place="bottom" {...{ tooltipMsg }}>
            <label> Juror Rewards </label>
          </WithHelpTooltip>

          {rewards.map(({ token, coinId, getValue, getAmount }) => {
            const coinPrice = !isUndefined(pricesData) ? pricesData[coinIdToAddress[coinId]]?.price : undefined;
            const totalReward = calculateTotalReward(coinId, data);
            return (
              <TokenRewards
                key={coinId}
                {...{ token }}
                amount={data ? getAmount(totalReward) : "Fetching..."}
                value={data ? getValue(totalReward, coinPrice) : "Fetching..."}
              />
            );
          })}
        </Container>
      )}
    </>
  );
};

export default Coherency;
