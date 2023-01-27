import { useState, useEffect } from "react";
import { getTimeLeft } from "utils/date";

export function useCountdown(deadline?: number): number | undefined {
  const [counter, setCounter] = useState<number | undefined>();
  useEffect(() => {
    if (typeof deadline !== "undefined") {
      const timeLeft = getTimeLeft(deadline);
      setCounter(timeLeft);
    }
  }, [deadline]);
  useEffect(() => {
    typeof counter !== "undefined" &&
      counter > 0 &&
      setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);
  return counter;
}
