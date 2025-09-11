import { useQuery } from "@tanstack/react-query";

const fetchCoinPrices = async (coinIds: readonly string[]): Promise<Prices> => {
  const ids = Array.from(new Set(coinIds)).filter(Boolean).sort().map(encodeURIComponent).join(",");
  if (!ids) return {};
  const response = await fetch(`https://coins.llama.fi/prices/current/${ids}?searchWidth=1h`);
  if (!response.ok) throw new Error(`Failed to fetch coin prices (${response.status})`);
  const data = await response.json();
  return (data?.coins ?? {}) as Prices;
};

export type Prices = {
  [coinId: string]: { price: number };
};

export const useCoinPrice = (coinIds: string[]) => {
  const {
    data: prices,
    isError,
    isLoading,
    error,
  } = useQuery<Prices>({
    queryKey: ["coinPrice", coinIds],
    enabled: Array.isArray(coinIds) && coinIds.length > 0,
    queryFn: () => fetchCoinPrices(coinIds),
  });
  return {
    prices,
    isError,
    isLoading,
    error,
  };
};
