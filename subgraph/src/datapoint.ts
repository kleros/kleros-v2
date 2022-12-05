import { BigInt, Value } from "@graphprotocol/graph-ts";
import { Counter } from "../generated/schema";
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
  const newDataPoint = new Counter(dayStartTimestamp.toString());
  let counter = Counter.load("0");
  if (!counter) {
    counter = new Counter("0");
    for (let i = 0; i < VARIABLES.length; i++) {
      counter.set(VARIABLES[i], Value.fromBigInt(ZERO));
    }
  } else {
    for (let i = 0; i < VARIABLES.length; i++) {
      if (VARIABLES[i] !== variable) {
        newDataPoint.set(VARIABLES[i], counter.get(VARIABLES[i])!);
      } else {
        const newValue = counter.get(variable)!.toBigInt().plus(delta);
        newDataPoint.set(variable, Value.fromBigInt(newValue));
        counter.set(variable, Value.fromBigInt(newValue));
      }
    }
  }
  counter.save();
  newDataPoint.save();
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
