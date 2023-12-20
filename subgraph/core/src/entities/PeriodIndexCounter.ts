import { PeriodIndexCounter } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function getAndIncrementPeriodCounter(id: string): BigInt {
  let counter = PeriodIndexCounter.load(id);
  if (!counter) {
    counter = new PeriodIndexCounter(id);
    counter.counter = BigInt.fromI32(0);
  }
  const counterOld = counter.counter;
  counter.counter = counter.counter.plus(BigInt.fromI32(1));
  counter.save();
  return counterOld;
}
