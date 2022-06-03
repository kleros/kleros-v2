import {
  Address,
  BigInt,
  Entity,
  Value,
  store,
} from "@graphprotocol/graph-ts";
import {
  KlerosCore,
  AppealDecision,
  DisputeCreation,
  Draw as DrawEvent,
  NewPeriod,
  StakeSet,
  TokenAndETHShift as TokenAndETHShiftEvent
} from "../generated/KlerosCore/KlerosCore";
import {
  Juror,
  TokenAndETHShift,
  JurorTokensPerSubcourt,
  Round,
  Draw,
  Dispute,
} from "../generated/schema";

function getPeriodName(index: i32): string {
  const periodArray = ["Evidence", "Commit", "Vote", "Appeal", "Execution"];
  return periodArray.at(index) || "None";
}

export function handleAppealDecision(event: AppealDecision): void {
  const disputeID = event.params._disputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (dispute) {
    const contract = KlerosCore.bind(event.address);
    const newRoundIndex = dispute.currentRound + 1;
    const round = new Round(
      `${disputeID.toString()}-${newRoundIndex.toString()}`
    );
    const roundInfo = contract.getRoundInfo(
      disputeID, BigInt.fromI64(newRoundIndex)
    );
    round.dispute = disputeID.toString();
    round.tokensAtStakePerJuror = roundInfo.value0;
    round.totalFeesForJurors = roundInfo.value1;
    round.repartitions = roundInfo.value2;
    round.penalties = roundInfo.value3;
    dispute.currentRound = newRoundIndex;
    round.save();
    dispute.save();
  }
}

export function handleDisputeCreation(event: DisputeCreation): void {
  const contract = KlerosCore.bind(event.address);
  const disputeID = event.params._disputeID;
  const dispute = new Dispute(disputeID.toString());
  const disputeStorage = contract.disputes(disputeID);
  const subcourtID = disputeStorage.value0.toString();
  dispute.arbitrated = event.params._arbitrable;
  dispute.subcourtID = subcourtID;
  dispute.disputeKit = disputeStorage.value2;
  dispute.period = "Evidence";
  dispute.ruled = false;
  dispute.lastPeriodChange = disputeStorage.value5;
  dispute.nbVotes = disputeStorage.value6;
  dispute.currentRound = 0;
  const roundInfo = contract.getRoundInfo(disputeID, BigInt.fromString("0"));
  const round = new Round(`${disputeID.toString()}-0`);
  round.dispute = disputeID.toString();
  round.tokensAtStakePerJuror = roundInfo.value0;
  round.totalFeesForJurors = roundInfo.value1;
  round.repartitions = roundInfo.value2;
  round.penalties = roundInfo.value3;
  dispute.save();
  round.save();
  updateCases(BigInt.fromI32(1), event.block.timestamp);
}

export function handleNewPeriod(event: NewPeriod): void {
  const disputeID = event.params._disputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (dispute) {
    dispute.period = getPeriodName(event.params._period);
    dispute.save();
  }
}

export function handleDraw(event: DrawEvent): void {
  const disputeID = event.params._disputeID;
  const currentRound = event.params._appeal;
  const voteID = event.params._voteID;
  const drawID = (
    `${disputeID.toString()}-${currentRound.toString()}-${voteID.toString()}`
  );
  const drawnAddress = event.params._address;
  const draw = new Draw(drawID);
  draw.round = currentRound.toString();
  draw.juror = drawnAddress.toHexString();
  draw.voteID = voteID;
  draw.save();
  const dispute = Dispute.load(disputeID.toString());
  if (dispute) {
    updateJurorBalance(
      drawnAddress.toHexString(), dispute.subcourtID.toString(), event
    );
  }
}

function updateJurorBalance(
  address: string, subcourt: string, event: DrawEvent
): void {
  const jurorTokens = new JurorTokensPerSubcourt(`${address}-${subcourt}`);
  const contract = KlerosCore.bind(event.address);
  const jurorBalance = contract.getJurorBalance(
    Address.fromString(address), BigInt.fromString(subcourt)
  );
  jurorTokens.locked = jurorBalance.value1;
  jurorTokens.save();
}

export function handleStakeSet(event: StakeSet): void {
  const jurorAddress = event.params._address.toHexString();
  let juror = Juror.load(jurorAddress);
  if (!juror) {
    juror = new Juror(jurorAddress);
    updateActiveJurors(BigInt.fromI32(1), event.block.timestamp);
  }
  juror.save();
  const subcourtID = event.params._subcourtID;
  const amountStaked = event.params._newTotalStake;
  const jurorTokensID = `${jurorAddress}-${subcourtID.toString()}`;
  let jurorTokens = JurorTokensPerSubcourt.load(jurorTokensID);
  let previousStake: BigInt;
  if (!jurorTokens) {
    jurorTokens = new JurorTokensPerSubcourt(jurorTokensID);
    jurorTokens.juror = jurorAddress;
    jurorTokens.subcourt = subcourtID.toString();
    jurorTokens.locked = BigInt.fromI32(0);
    previousStake = BigInt.fromI32(0);
  } else previousStake = jurorTokens.staked;
  jurorTokens.staked = amountStaked;
  jurorTokens.save();
  updateTotalPNKStaked(
    getDelta(previousStake, amountStaked), event.block.timestamp
  );
}

export function handleTokenAndETHShift(event: TokenAndETHShiftEvent): void {
  const jurorAddress = event.params._account.toHexString();
  const disputeID = event.params._disputeID;
  const shiftID = `${jurorAddress}-${disputeID.toString()}`;
  const tokenAmount = event.params._tokenAmount;
  const ethAmount = event.params._ETHAmount;
  const shift = new TokenAndETHShift(shiftID);
  if (tokenAmount.gt(BigInt.fromI32(0))) {
    updatePNKRedistributed(tokenAmount, event.block.timestamp);
  }
  updateETHPaid(ethAmount, event.block.timestamp);
  shift.juror = jurorAddress;
  shift.dispute = disputeID.toString();
  shift.tokenAmount = tokenAmount;
  shift.ethAmount = ethAmount;
  shift.save();
}

function getDelta(previousValue: BigInt, newValue: BigInt): BigInt {
  return (newValue.minus(previousValue));
}

function updateDataPoint(delta: BigInt, timestamp: BigInt, entityName: string): void {
  let counter = store.get(entityName, "0");
  if (!counter) {
    counter = new Entity();
    counter.set("value", Value.fromBigInt(BigInt.fromI32(0)));
  }
  const dayID = timestamp.toI32() / 86400;
  const dayStartTimestamp = dayID * 86400;
  const newValue = counter.get("value")!.toBigInt().plus(delta);
  const newDataPoint = new Entity();
  newDataPoint.set("value", Value.fromBigInt(newValue));
  store.set(entityName, dayStartTimestamp.toString(), newDataPoint);
  store.set(entityName, "0", newDataPoint);
}

function updateTotalPNKStaked(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "PNKStakedDataPoint");
}

function updatePNKRedistributed(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "PNKRedistributedDataPoint");
}

function updateETHPaid(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "ETHPaidDataPoint");
}

function updateActiveJurors(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "ActiveJurorsDataPoint");
}

function updateCases(delta: BigInt, timestamp: BigInt): void {
  updateDataPoint(delta, timestamp, "CasesDataPoint");
}
