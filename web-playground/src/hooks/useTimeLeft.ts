import { useState, useEffect } from "react";
import {
  IFastBridgeClaim,
  useFastBridgeChallengeDurationQuery,
} from "queries/useFastBridgeQuery";

const calculateTimeLeft = (claimedAt: number, challengeDuration: number) => {
  return Math.max(
    0,
    challengeDuration - (Math.floor(Date.now() / 1000) - claimedAt)
  );
};

export const useTimeLeft = (claim: IFastBridgeClaim) => {
  const { data: challengeDuration } = useFastBridgeChallengeDurationQuery();
  const [timeLeft, setTimeLeft] = useState<number>();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (challengeDuration)
        setTimeLeft(
          calculateTimeLeft(
            claim.claimedAt.toNumber(),
            challengeDuration.toNumber()
          )
        );
    }, 1000);
    return () => clearTimeout(timer);
  });
  return timeLeft;
};
