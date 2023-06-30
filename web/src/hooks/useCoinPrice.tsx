import useSWR from "swr";

const fetchCoinPrices = async (...coinIds) => {
  const response = await fetch(`https://coins.llama.fi/prices/current/${coinIds.join(",")}?searchWidth=1h`);
  const data = await response.json();
  return data.coins;
};

export const useCoinPrice = (coinIds: string[]) => {
  const { data: prices, error } = useSWR(coinIds, fetchCoinPrices);
  return {
    prices,
    error,
  };
};
