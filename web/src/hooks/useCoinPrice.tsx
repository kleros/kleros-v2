import { useQuery } from "@tanstack/react-query";

const fetchCoinPrices = async (...coinIds) => {
  const response = await fetch(`https://coins.llama.fi/prices/current/${coinIds.join(",")}?searchWidth=1h`);
  const data = await response.json();
  return data.coins;
};

export const useCoinPrice = (coinIds: string[]) => {
  const isEnabled = coinIds !== undefined;

  const { data: prices, isError } = useQuery({
    queryKey: [`coinPrice${coinIds}`],
    enabled: isEnabled,
    queryFn: async () => fetchCoinPrices(coinIds),
  });
  return {
    prices,
    isError,
  };
};
