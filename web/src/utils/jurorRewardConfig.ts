import { formatUnits, formatEther } from "viem";

import { CoinIds } from "consts/coingecko";
import { isUndefined } from "utils/index";

import { UserQuery } from "queries/useUser";

export interface IReward {
  token: "ETH" | "PNK";
  coinId: number;
  getAmount: (amount: bigint) => string;
  getValue?: (amount: bigint, coinPrice?: number) => string;
}

export const rewards: IReward[] = [
  {
    token: "ETH",
    coinId: 1,
    getAmount: (amount) => formatEther(amount),
    getValue: (amount, coinPrice) => (Number(formatEther(amount)) * (coinPrice ?? 0)).toString(),
  },
  {
    token: "PNK",
    coinId: 0,
    getAmount: (amount) => formatUnits(amount, 18),
    getValue: (amount, coinPrice) => (Number(formatUnits(amount, 18)) * (coinPrice ?? 0)).toString(),
  },
];

export const calculateTotalJurorReward = (coinId: number, data: UserQuery): bigint => {
  const total = data.user?.shifts
    .map((shift) => parseInt(coinId === 0 ? shift.pnkAmount : shift.ethAmount))
    .reduce((acc, curr) => acc + curr, 0);

  return BigInt(total ?? 0);
};

export const getFormattedRewards = (data: any, pricesData: any) => {
  return rewards.map(({ token, coinId, getValue, getAmount }) => {
    const coinPrice = !isUndefined(pricesData) ? pricesData[CoinIds[token]]?.price : undefined;

    const totalReward = data && calculateTotalJurorReward(coinId, data);
    return {
      token,
      amount: !isUndefined(totalReward) ? getAmount(totalReward) : undefined,
      value: getValue ? (!isUndefined(totalReward) ? getValue(totalReward, coinPrice) : undefined) : undefined,
    };
  });
};
