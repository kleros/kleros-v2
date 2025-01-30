import { BigInt, Entity, Value, store } from "@graphprotocol/graph-ts";
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
  "casesAppealing",
  "totalLeaderboardJurors",
];

function updateDataPoint(delta: BigInt, timestamp: BigInt, variable: string): void {
  checkFirstDayActivity();
  const newCounter = new Entity();
  const counter = store.get("Counter", "0");
  for (let i = 0; i < VARIABLES.length; i++) {
    const currentVar = VARIABLES[i];
    newCounter.set(currentVar, getNewValue(currentVar, variable, delta, counter));
  }
  const dayID = timestamp.toI32() / 86400;
  const dayStartTimestamp = dayID * 86400;
  store.set("Counter", dayStartTimestamp.toString(), newCounter);
  store.set("Counter", "0", newCounter);
}

function checkFirstDayActivity(): void {
  let counter = Counter.load("1691452800");
  if (!counter) {
    counter = new Counter("1691452800");
    counter.stakedPNK = ZERO;
    counter.redistributedPNK = ZERO;
    counter.paidETH = ZERO;
    counter.activeJurors = ZERO;
    counter.cases = ZERO;
    counter.casesVoting = ZERO;
    counter.casesRuled = ZERO;
    counter.casesAppealing = ZERO;
    counter.totalLeaderboardJurors = ZERO;
    counter.save();
  }
}

function getNewValue(currentVar: string, targetVar: string, delta: BigInt, counter: Entity | null): Value {
  if (currentVar === targetVar) {
    return !counter ? Value.fromBigInt(delta) : Value.fromBigInt(counter.get(currentVar)!.toBigInt().plus(delta));
  } else {
    return !counter ? Value.fromBigInt(ZERO) : counter.get(currentVar)!;
  }
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

export function updateCasesAppealing(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "casesAppealing");
}

export function updateTotalLeaderboardJurors(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "totalLeaderboardJurors");
}
