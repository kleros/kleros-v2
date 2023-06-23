import useSWR from "swr";

const fetchCoinPrice = async (coinId) => {
  console.log("jey", coinId);
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
  const data = await response.json();
  console.log("🚀 ~ file: useCoinPrice.tsx:7 ~ fetchCoinPrice ~ data:", data);
  console.log("🚀 ~ file: useCoinPrice.tsx:8 ~ fetchCoinPrice ~ data:", data.market_data);
  return data.market_data.current_price.usd;
};

export const useCoinPrice = (coinIds: string[]) => {
  console.log("2ey");

  const { data: prices, error } = useSWR<string[]>(coinIds, fetchCoinPrice);
  console.log("wat");
  return {
    prices,
    error,
  };
};
