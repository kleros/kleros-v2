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
} from "../generated/schema";

function getPeriodName(index: number): string {
  if (index === 0)
    return "Evidence";
  else if (index === 1)
    return "Commit";
  else if (index === 2)
    return "Vote";
  else if (index === 3)
    return "Appeal";
  else if (index === 4)
    return "Execution";
  else
    return "None";
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
}

export function handleStakeSet(event: StakeSet): void {
  const jurorAddress = event.params._address.toHexString();
  let juror = Juror.load(jurorAddress);
  if (!juror) {
    juror = new Juror(jurorAddress);
  }
  juror.save();
  const subcourtID = event.params._subcourtID;
  const amountStaked = event.params._newTotalStake;
  const jurorTokensID = `${jurorAddress}-${subcourtID.toString()}`;
  let jurorTokens = JurorTokensPerSubcourt.load(jurorTokensID);
  if (!jurorTokens) {
    jurorTokens = new JurorTokensPerSubcourt(jurorTokensID);
    jurorTokens.juror = jurorAddress;
    jurorTokens.subcourt = subcourtID.toString();
    jurorTokens.locked = BigInt.fromI32(0);
  }
  jurorTokens.staked = amountStaked;
  jurorTokens.save();
}

export function handleTokenAndETHShift(event: TokenAndETHShiftEvent): void {
  const jurorAddress = event.params._account.toHexString();
  const disputeID = event.params._disputeID;
  const shiftID = `${jurorAddress}-${disputeID.toString()}`;
  const tokenAmount = event.params._tokenAmount;
  const ethAmount = event.params._ETHAmount;
  const shift = new TokenAndETHShift(shiftID);
  shift.juror = jurorAddress;
  shift.dispute = disputeID.toString();
  shift.tokenAmount = tokenAmount;
  shift.ethAmount = ethAmount;
  shift.save();
}
