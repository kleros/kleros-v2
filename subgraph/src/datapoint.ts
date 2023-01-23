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
  const newCounter = new Entity();
  const counter = store.get("Counter", "0");
  for (let i = 0; i < VARIABLES.length; i++) {
    const targetVar = VARIABLES[i];
    if (targetVar === variable) {
      newCounter.set(
        targetVar,
        !counter
          ? Value.fromBigInt(delta)
          : Value.fromBigInt(counter.get(targetVar)!.toBigInt().plus(delta))
      );
    } else {
      newCounter.set(
        targetVar,
        !counter ? Value.fromBigInt(ZERO) : counter.get(VARIABLES[i])!
      );
    }
  }
  const dayID = timestamp.toI32() / 86400;
  const dayStartTimestamp = dayID * 86400;
  store.set("Counter", dayStartTimestamp.toString(), newCounter);
  store.set("Counter", "0", newCounter);
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
