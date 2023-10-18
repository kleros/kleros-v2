import { PeriodIndexCounter } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function ensurePeriodIndexCounter(id: string): PeriodIndexCounter {
  let counter = PeriodIndexCounter.load(id);
  if (!counter) {
    counter = new PeriodIndexCounter(id);
    counter.counter = BigInt.fromI32(0);
  }
  return counter;
}
