import { BigInt } from "@graphprotocol/graph-ts";
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
  PNKStakedDataPoint,
  PNKRedistributedDataPoint,
  ETHPaidDataPoint,
  ActiveJurorsDataPoint,
  CasesDataPoint,
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
    const jurorTokens = JurorTokensPerSubcourt.load(
      `${drawnAddress.toHexString()}-${dispute.subcourtID.toString()}`
    );
    if (jurorTokens) {
      const contract = KlerosCore.bind(event.address);
      const jurorBalance = contract.getJurorBalance(
        drawnAddress, BigInt.fromString(dispute.subcourtID)
      );
      jurorTokens.locked = jurorBalance.value1;
      jurorTokens.save();
    }
  }
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
  updateTotalPNKStaked(getDelta(previousStake, amountStaked), event.block.timestamp);
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

function updateTotalPNKStaked(delta: BigInt, timestamp: BigInt): void {
  let counter = PNKStakedDataPoint.load("0");
  if (!counter) {
    counter = new PNKStakedDataPoint("0");
    counter.length = 0;
    counter.value = BigInt.fromI32(0);
    counter.timestamp = BigInt.fromI32(0);
    counter.save();
  }
  const newLength = counter.length + 1;
  const newValue = counter.value.plus(delta);
  const newDataPoint = new PNKStakedDataPoint(newLength.toString());
  newDataPoint.value = newValue;
  newDataPoint.timestamp = timestamp;
  newDataPoint.length = newLength;
  newDataPoint.save();
  counter.value = newValue;
  counter.timestamp = timestamp;
  counter.length = newLength;
  counter.save();
}

function updatePNKRedistributed(delta: BigInt, timestamp: BigInt): void {
  let counter = PNKRedistributedDataPoint.load("0");
  if (!counter) {
    counter = new PNKRedistributedDataPoint("0");
    counter.length = 0;
    counter.value = BigInt.fromI32(0);
    counter.timestamp = BigInt.fromI32(0);
    counter.save();
  }
  const newLength = counter.length + 1;
  const newValue = counter.value.plus(delta);
  const newDataPoint = new PNKRedistributedDataPoint(newLength.toString());
  newDataPoint.value = newValue;
  newDataPoint.timestamp = timestamp;
  newDataPoint.length = newLength;
  newDataPoint.save();
  counter.value = newValue;
  counter.timestamp = timestamp;
  counter.length = newLength;
  counter.save();
}

function updateETHPaid(delta: BigInt, timestamp: BigInt): void {
  let counter = ETHPaidDataPoint.load("0");
  if (!counter) {
    counter = new ETHPaidDataPoint("0");
    counter.length = 0;
    counter.value = BigInt.fromI32(0);
    counter.timestamp = BigInt.fromI32(0);
    counter.save();
  }
  const newLength = counter.length + 1;
  const newValue = counter.value.plus(delta);
  const newDataPoint = new ETHPaidDataPoint(newLength.toString());
  newDataPoint.value = newValue;
  newDataPoint.timestamp = timestamp;
  newDataPoint.length = newLength;
  newDataPoint.save();
  counter.value = newValue;
  counter.timestamp = timestamp;
  counter.length = newLength;
  counter.save();
}

function updateActiveJurors(delta: BigInt, timestamp: BigInt): void {
  let counter = ActiveJurorsDataPoint.load("0");
  if (!counter) {
    counter = new ActiveJurorsDataPoint("0");
    counter.length = 0;
    counter.value = BigInt.fromI32(0);
    counter.timestamp = BigInt.fromI32(0);
    counter.save();
  }
  const newLength = counter.length + 1;
  const newValue = counter.value.plus(delta);
  const newDataPoint = new ActiveJurorsDataPoint(newLength.toString());
  newDataPoint.value = newValue;
  newDataPoint.timestamp = timestamp;
  newDataPoint.length = newLength;
  newDataPoint.save();
  counter.value = newValue;
  counter.timestamp = timestamp;
  counter.length = newLength;
  counter.save();
}

function updateCases(delta: BigInt, timestamp: BigInt): void {
  let counter = CasesDataPoint.load("0");
  if (!counter) {
    counter = new CasesDataPoint("0");
    counter.length = 0;
    counter.value = BigInt.fromI32(0);
    counter.timestamp = BigInt.fromI32(0);
    counter.save();
  }
  const newLength = counter.length + 1;
  const newValue = counter.value.plus(delta);
  const newDataPoint = new CasesDataPoint(newLength.toString());
  newDataPoint.value = newValue;
  newDataPoint.timestamp = timestamp;
  newDataPoint.length = newLength;
  newDataPoint.save();
  counter.value = newValue;
  counter.timestamp = timestamp;
  counter.length = newLength;
  counter.save();
}
