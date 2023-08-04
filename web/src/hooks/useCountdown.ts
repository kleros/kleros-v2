import { useState, useEffect } from "react";
import { getTimeLeft } from "utils/date";
import { isUndefined } from "utils/index";

export function useCountdown(deadline?: number): number | undefined {
  const [counter, setCounter] = useState<number | undefined>();
  useEffect(() => {
    if (typeof deadline !== "undefined") {
      const timeLeft = getTimeLeft(deadline);
      setCounter(timeLeft);
    }
  }, [deadline]);
  useEffect(() => {
    if (!isUndefined(counter) && counter > 0) {
      const timeout = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timeout);
    } else return;
  }, [counter]);
  return counter;
}
