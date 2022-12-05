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
  const dayID = timestamp.toI32() / 86400;
  const dayStartTimestamp = dayID * 86400;
  const newDataPoint = new Entity();
  const counter = store.get("Counter", "0");
  if (!counter) {
    for (let i = 0; i < VARIABLES.length; i++) {
      if (VARIABLES[i] !== variable) {
        newDataPoint.set(VARIABLES[i], Value.fromBigInt(ZERO));
      } else {
        newDataPoint.set(variable, Value.fromBigInt(delta));
      }
    }
  } else {
    for (let i = 0; i < VARIABLES.length; i++) {
      if (VARIABLES[i] !== variable) {
        newDataPoint.set(variable, counter.get(VARIABLES[i])!);
      } else {
        const newValue = counter.get(variable)!.toBigInt().plus(delta);
        newDataPoint.set(variable, Value.fromBigInt(newValue));
      }
    }
  }
  store.set("Counter", dayStartTimestamp.toString(), newDataPoint);
  store.set("Counter", "0", newDataPoint);
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
