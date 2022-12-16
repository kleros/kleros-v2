import { BigInt, Entity, Value, store } from "@graphprotocol/graph-ts";
import { ZERO } from "./utils";

export function getDelta(previousValue: BigInt, newValue: BigInt): BigInt {
  return newValue.minus(previousValue);
}

const VARIABLES = [
  "stakedPNK",
  "redistributedPNK",
  "paidETH",
  "activeJurors",
  "cases",
  "casesVoting",
  "casesRuled",
];

function updateDataPoint(
  delta: BigInt,
  timestamp: BigInt,
  variable: string
): void {
  let counter = store.get("Counter", "0");
  if (!counter) {
    counter = new Entity();
    for (let i = 0; i < VARIABLES.length; i++) {
      counter.set(VARIABLES[i], Value.fromBigInt(ZERO));
    }
  }
  const dayID = timestamp.toI32() / 86400;
  const dayStartTimestamp = dayID * 86400;
  const newValue = counter.get(variable)!.toBigInt().plus(delta);
  counter.set(variable, Value.fromBigInt(newValue));
  store.set("Counter", dayStartTimestamp.toString(), counter);
  store.set("Counter", "0", counter);
}

export function updateStakedPNK(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "stakedPNK");
}

export function updateRedistributedPNK(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "redistributedPNK");
}

export function updatePaidETH(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "paidETH");
}

export function updateActiveJurors(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "activeJurors");
}

export function updateCases(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "cases");
}

export function updateCasesVoting(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "casesVoting");
}

export function updateCasesRuled(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "casesRuled");
}
