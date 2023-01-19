import { useState, useEffect } from "react";
import { getTimeLeft } from "utils/date";

export function useCountdown(deadline: number): number {
  const timeLeft = getTimeLeft(deadline);
  const [counter, setCounter] = useState<number>(timeLeft);
  useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);
  return counter;
}
