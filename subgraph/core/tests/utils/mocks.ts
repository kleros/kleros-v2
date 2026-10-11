import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { createMockedFunction } from "matchstick-as/assembly/index";
import { CORE, RATES_CONVERTER, SORTITION } from "./constants";

const GET_ROUND_INFO_SIG =
  "getRoundInfo(uint256,uint256):((uint256,uint256,uint256,uint256,uint256,uint256,address[],uint96[],uint256,uint256,address,uint256,bool,uint256,uint256[4],uint256[10]))";

/** Mirrors KlerosCore.RoundInfo; defaults describe a 3-juror round paid in ETH in dispute kit 1. */
export class RoundInfo {
  disputeKitID: BigInt = BigInt.fromI32(1);
  pnkAtStakePerJuror: BigInt = BigInt.fromI32(1000);
  totalFeesForJurors: BigInt = BigInt.fromI32(300);
  nbVotes: BigInt = BigInt.fromI32(3);
  repartitions: BigInt = BigInt.zero();
  pnkPenalties: BigInt = BigInt.zero();
  drawnJurors: Address[] = [];
  drawnJurorFromCourtIDs: BigInt[] = [];
  sumFeeRewardPaid: BigInt = BigInt.zero();
  sumPnkRewardPaid: BigInt = BigInt.zero();
  feeToken: Address = Address.zero();
  drawIterations: BigInt = BigInt.zero();
  hiddenVotes: boolean = false;
  jurorsForCourtJump: BigInt = BigInt.fromI32(511);
  timesPerPeriod: BigInt[] = [BigInt.fromI32(100), BigInt.fromI32(200), BigInt.fromI32(300), BigInt.fromI32(400)];

  withDisputeKit(id: i32): RoundInfo {
    this.disputeKitID = BigInt.fromI32(id);
    return this;
  }

  withVotes(nbVotes: i32): RoundInfo {
    this.nbVotes = BigInt.fromI32(nbVotes);
    return this;
  }

  withRepartitions(repartitions: i32): RoundInfo {
    this.repartitions = BigInt.fromI32(repartitions);
    return this;
  }

  withFeeToken(token: Address): RoundInfo {
    this.feeToken = token;
    return this;
  }

  withTotalFees(totalFeesForJurors: BigInt): RoundInfo {
    this.totalFeesForJurors = totalFeesForJurors;
    return this;
  }
}

function u(value: BigInt): ethereum.Value {
  return ethereum.Value.fromUnsignedBigInt(value);
}

export function mockRoundInfo(disputeID: BigInt, round: BigInt, info: RoundInfo): void {
  const gap: BigInt[] = [];
  for (let i = 0; i < 10; i++) gap.push(BigInt.zero());
  const tuple = new ethereum.Tuple();
  tuple.push(u(info.disputeKitID));
  tuple.push(u(info.pnkAtStakePerJuror));
  tuple.push(u(info.totalFeesForJurors));
  tuple.push(u(info.nbVotes));
  tuple.push(u(info.repartitions));
  tuple.push(u(info.pnkPenalties));
  tuple.push(ethereum.Value.fromAddressArray(info.drawnJurors));
  tuple.push(ethereum.Value.fromUnsignedBigIntArray(info.drawnJurorFromCourtIDs));
  tuple.push(u(info.sumFeeRewardPaid));
  tuple.push(u(info.sumPnkRewardPaid));
  tuple.push(ethereum.Value.fromAddress(info.feeToken));
  tuple.push(u(info.drawIterations));
  tuple.push(ethereum.Value.fromBoolean(info.hiddenVotes));
  tuple.push(u(info.jurorsForCourtJump));
  tuple.push(ethereum.Value.fromUnsignedBigIntArray(info.timesPerPeriod));
  tuple.push(ethereum.Value.fromUnsignedBigIntArray(gap));
  createMockedFunction(CORE, "getRoundInfo", GET_ROUND_INFO_SIG)
    .withArgs([u(disputeID), u(round)])
    .returns([ethereum.Value.fromTuple(tuple)]);
}

export function mockDisputes(
  disputeID: BigInt,
  courtID: BigInt,
  period: i32 = 0,
  ruled: boolean = false,
  executed: boolean = false
): void {
  createMockedFunction(CORE, "disputes", "disputes(uint256):(uint96,address,uint8,bool,bool,uint256)")
    .withArgs([u(disputeID)])
    .returns([
      u(courtID),
      ethereum.Value.fromAddress(Address.zero()),
      ethereum.Value.fromI32(period),
      ethereum.Value.fromBoolean(ruled),
      ethereum.Value.fromBoolean(executed),
      u(BigInt.zero()),
    ]);
}

export function mockDisputesReverts(disputeID: BigInt): void {
  createMockedFunction(CORE, "disputes", "disputes(uint256):(uint96,address,uint8,bool,bool,uint256)")
    .withArgs([u(disputeID)])
    .reverts();
}

export function mockNumberOfRounds(disputeID: BigInt, numberOfRounds: i32): void {
  createMockedFunction(CORE, "getNumberOfRounds", "getNumberOfRounds(uint256):(uint256)")
    .withArgs([u(disputeID)])
    .returns([u(BigInt.fromI32(numberOfRounds))]);
}

export function mockCurrentRuling(disputeID: BigInt, ruling: BigInt, tied: boolean, overridden: boolean = false): void {
  createMockedFunction(CORE, "currentRuling", "currentRuling(uint256):(uint256,bool,bool)")
    .withArgs([u(disputeID)])
    .returns([u(ruling), ethereum.Value.fromBoolean(tied), ethereum.Value.fromBoolean(overridden)]);
}

export function mockSortitionModule(): void {
  createMockedFunction(CORE, "sortitionModule", "sortitionModule():(address)").returns([
    ethereum.Value.fromAddress(SORTITION),
  ]);
}

/** SortitionModule.getJurorBalance: lockedPnk is the juror's total across all courts. */
export function mockJurorBalance(
  juror: Address,
  courtID: BigInt,
  totalStaked: BigInt,
  totalLocked: BigInt,
  stakedInCourt: BigInt,
  nbCourts: i32 = 1
): void {
  createMockedFunction(
    SORTITION,
    "getJurorBalance",
    "getJurorBalance(address,uint96):(uint256,uint256,uint256,uint256)"
  )
    .withArgs([ethereum.Value.fromAddress(juror), u(courtID)])
    .returns([u(totalStaked), u(totalLocked), u(stakedInCourt), u(BigInt.fromI32(nbCourts))]);
}

export function mockDisputeKitCore(disputeKit: Address): void {
  createMockedFunction(disputeKit, "core", "core():(address)").returns([ethereum.Value.fromAddress(CORE)]);
}

export function mockCoherentCount(disputeKit: Address, disputeID: BigInt, round: BigInt, coherentCount: i32): void {
  createMockedFunction(disputeKit, "getCoherentCount", "getCoherentCount(uint256,uint256):(uint256)")
    .withArgs([u(disputeID), u(round)])
    .returns([u(BigInt.fromI32(coherentCount))]);
}

export function mockDisputeKitAddress(disputeKitID: BigInt, disputeKit: Address): void {
  createMockedFunction(CORE, "disputeKits", "disputeKits(uint256):(address)")
    .withArgs([u(disputeKitID)])
    .returns([ethereum.Value.fromAddress(disputeKit)]);
}

export function mockRates(token: Address, rateInEth: BigInt, rateDecimals: i32): void {
  createMockedFunction(CORE, "ratesConverter", "ratesConverter():(address)").returns([
    ethereum.Value.fromAddress(RATES_CONVERTER),
  ]);
  createMockedFunction(RATES_CONVERTER, "currencyRates", "currencyRates(address):(uint64,uint8)")
    .withArgs([ethereum.Value.fromAddress(token)])
    .returns([u(rateInEth), ethereum.Value.fromI32(rateDecimals)]);
}
