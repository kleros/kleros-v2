import { useEffect, useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { useHomePageBlockQuery, HomePageBlockStats } from "./useHomePageBlockQuery";

type ReturnType = UseQueryResult<HomePageBlockStats, Error>;

export const useHomePageExtraStats = (days: number | string): ReturnType => {
  const [pastTimestamp, setPastTimestamp] = useState<bigint | undefined>();

  useEffect(() => {
    if (typeof days !== "string") {
      const currentTimestamp = BigInt(Math.floor(Date.now() / 1000)); // Current time in seconds
      const secondsInDays = BigInt(days * 24 * 3600);
      const pastTime = currentTimestamp - secondsInDays;
      setPastTimestamp(pastTime);
    }
  }, [days]);

  const data = useHomePageBlockQuery(pastTimestamp, days === "allTime");
  return data;
};
