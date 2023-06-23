import useSWR from "swr";

const fetchCoinPrice = async (...coinIds) => {
  const fetchData = async (coinId) => {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    const data = await response.json();
    return data.market_data.current_price.usd;
  };

  const prices = await Promise.all(coinIds.map(fetchData));
  return prices;
};

export const useCoinPrice = (coinIds: string[]) => {
  const { data: prices, error } = useSWR<number[]>(coinIds, fetchCoinPrice);
  return {
    prices,
    error,
  };
};
