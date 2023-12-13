import {
  KlerosCore,
  AppealDecision,
  DisputeCreation,
  DisputeKitCreated,
  DisputeKitEnabled,
  CourtCreated,
  CourtModified,
  Draw as DrawEvent,
  NewPeriod,
  StakeSet,
  TokenAndETHShift as TokenAndETHShiftEvent,
  CourtJump,
  Ruling,
  StakeDelayedNotTransferred,
  AcceptedFeeToken,
} from "../generated/KlerosCore/KlerosCore";
import { ZERO, ONE } from "./utils";
import { createCourtFromEvent } from "./entities/Court";
import { createDisputeKitFromEvent, filterSupportedDisputeKits } from "./entities/DisputeKit";
import { createDisputeFromEvent } from "./entities/Dispute";
import { createRoundFromRoundInfo } from "./entities/Round";
import { updateCases, updateCasesAppealing, updateCasesRuled, updateCasesVoting } from "./datapoint";
import { addUserActiveDispute, ensureUser } from "./entities/User";
import { updateJurorDelayedStake, updateJurorStake } from "./entities/JurorTokensPerCourt";
import { createDrawFromEvent } from "./entities/Draw";
import { updateTokenAndEthShiftFromEvent } from "./entities/TokenAndEthShift";
import { updateArbitrableCases } from "./entities/Arbitrable";
import { Court, Dispute, User } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { updatePenalty } from "./entities/Penalty";
import { ensureFeeToken } from "./entities/FeeToken";
import { getAndIncrementPeriodCounter } from "./entities/PeriodIndexCounter";

function getPeriodName(index: i32): string {
  const periodArray = ["evidence", "commit", "vote", "appeal", "execution"];
  return periodArray.at(index) || "None";
}

export function handleCourtCreated(event: CourtCreated): void {
  createCourtFromEvent(event);
}

export function handleCourtModified(event: CourtModified): void {
  const court = Court.load(event.params._courtID.toString());
  if (!court) return;
  court.hiddenVotes = event.params._hiddenVotes;
  court.minStake = event.params._minStake;
  court.alpha = event.params._alpha;
  court.feeForJuror = event.params._feeForJuror;
  court.jurorsForCourtJump = event.params._jurorsForCourtJump;
  court.timesPerPeriod = event.params._timesPerPeriod;
  court.save();
}

export function handleDisputeKitCreated(event: DisputeKitCreated): void {
  createDisputeKitFromEvent(event);
}

export function handleDisputeKitEnabled(event: DisputeKitEnabled): void {
  const court = Court.load(event.params._courtID.toString());
  if (!court) return;
  const isEnable = event.params._enable;
  const disputeKitID = event.params._disputeKitID.toString();
  court.supportedDisputeKits = isEnable
    ? court.supportedDisputeKits.concat([disputeKitID])
    : filterSupportedDisputeKits(court.supportedDisputeKits, disputeKitID);
  court.save();
}

export function handleDisputeCreation(event: DisputeCreation): void {
  const contract = KlerosCore.bind(event.address);
  const disputeID = event.params._disputeID;
  const disputeStorage = contract.disputes(disputeID);
  const courtID = disputeStorage.value0.toString();
  const court = Court.load(courtID);
  if (!court) return;
  court.numberDisputes = court.numberDisputes.plus(ONE);
  court.save();
  createDisputeFromEvent(event);
  const roundInfo = contract.getRoundInfo(disputeID, ZERO);
  createRoundFromRoundInfo(disputeID, ZERO, roundInfo);
  const arbitrable = event.params._arbitrable.toHexString();
  updateArbitrableCases(arbitrable, ONE);
  updateCases(ONE, event.block.timestamp);
}

export function handleNewPeriod(event: NewPeriod): void {
  const disputeID = event.params._disputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (!dispute) return;
  const court = Court.load(dispute.court);
  if (!court) return;

  if (dispute.period.includes("vote")) {
    court.numberVotingDisputes = court.numberVotingDisputes.minus(ONE);
    updateCasesVoting(BigInt.fromI32(-1), event.block.timestamp);
  } else if (dispute.period.includes("appeal")) {
    let juror: User;
    for (let i = 0; i < dispute.jurors.entries.length; i++) {
      juror = ensureUser(dispute.jurors.entries[i].value.toString());
      juror.totalAppealingDisputes = juror.totalAppealingDisputes.minus(ONE);
      juror.save();
    }
    court.numberAppealingDisputes = court.numberAppealingDisputes.minus(ONE);
    updateCasesAppealing(BigInt.fromI32(-1), event.block.timestamp);
  }

  const newPeriod = getPeriodName(event.params._period);
  if (newPeriod === "vote") {
    court.numberVotingDisputes = court.numberVotingDisputes.plus(ONE);
    updateCasesVoting(ONE, event.block.timestamp);
  } else if (newPeriod === "appeal") {
    let juror: User;
    for (let i = 0; i < dispute.jurors.entries.length; i++) {
      juror = ensureUser(dispute.jurors.entries[i].value.toString());
      juror.totalAppealingDisputes = juror.totalAppealingDisputes.plus(ONE);
      juror.save();
    }
    court.numberAppealingDisputes = court.numberAppealingDisputes.plus(ONE);
    updateCasesAppealing(ONE, event.block.timestamp);
  } else if (newPeriod === "execution") {
    const contract = KlerosCore.bind(event.address);
    const currentRulingInfo = contract.currentRuling(disputeID);
    dispute.currentRuling = currentRulingInfo.getRuling();
    dispute.overridden = currentRulingInfo.getOverridden();
    dispute.tied = currentRulingInfo.getTied();
  }

  dispute.period = newPeriod;
  dispute.lastPeriodChange = event.block.timestamp;
  dispute.lastPeriodChangeBlockNumber = event.block.number;
  dispute.periodNotificationIndex = getAndIncrementPeriodCounter(newPeriod);
  if (newPeriod !== "execution") {
    dispute.periodDeadline = event.block.timestamp.plus(court.timesPerPeriod[event.params._period]);
  } else {
    dispute.periodDeadline = BigInt.fromU64(U64.MAX_VALUE);
  }
  dispute.save();
  court.save();
}

export function handleRuling(event: Ruling): void {
  updateCasesRuled(ONE, event.block.timestamp);
  const disputeID = event.params._disputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (!dispute) return;
  dispute.ruled = true;
  dispute.save();
  const court = Court.load(dispute.court);
  if (!court) return;
  court.numberClosedDisputes = court.numberClosedDisputes.plus(ONE);
  court.save();
}

export function handleAppealDecision(event: AppealDecision): void {
  const contract = KlerosCore.bind(event.address);
  const disputeID = event.params._disputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (!dispute) return;
  const newRoundIndex = dispute.currentRoundIndex.plus(ONE);
  const roundID = `${disputeID}-${newRoundIndex.toString()}`;
  dispute.currentRoundIndex = newRoundIndex;
  dispute.currentRound = roundID;
  dispute.save();
  const roundInfo = contract.getRoundInfo(disputeID, newRoundIndex);
  createRoundFromRoundInfo(disputeID, newRoundIndex, roundInfo);
}

export function handleCourtJump(event: CourtJump): void {
  const dispute = Dispute.load(event.params._disputeID.toString());
  if (!dispute) return;
  dispute.court = event.params._toCourtID.toString();
  dispute.save();
}

export function handleDraw(event: DrawEvent): void {
  createDrawFromEvent(event);
  const disputeID = event.params._disputeID.toString();
  const dispute = Dispute.load(disputeID);
  if (!dispute) return;
  const contract = KlerosCore.bind(event.address);
  const jurorAddress = event.params._address.toHexString();
  updateJurorStake(jurorAddress, dispute.court, contract, event.block.timestamp);
  addUserActiveDispute(jurorAddress, disputeID);
}

export function handleStakeSet(event: StakeSet): void {
  const jurorAddress = event.params._address.toHexString();
  ensureUser(jurorAddress);
  const courtID = event.params._courtID.toString();

  updateJurorStake(jurorAddress, courtID.toString(), KlerosCore.bind(event.address), event.block.timestamp);

  // Check if the transaction the event comes from is executeDelayedStakes
  if (event.transaction.input.toHexString().substring(0, 10) === "0x35975f4a") {
    updateJurorDelayedStake(jurorAddress, courtID, ZERO.minus(event.params._amount));
  }
}

export function handleStakeDelayedNotTransferred(event: StakeDelayedNotTransferred): void {
  updateJurorDelayedStake(event.params._address.toHexString(), event.params._courtID.toString(), event.params._amount);
}

export function handleTokenAndETHShift(event: TokenAndETHShiftEvent): void {
  updatePenalty(event);
  updateTokenAndEthShiftFromEvent(event);
  const jurorAddress = event.params._account.toHexString();
  const disputeID = event.params._disputeID.toString();
  const dispute = Dispute.load(disputeID);
  if (!dispute) return;
  const court = Court.load(dispute.court);
  if (!court) return;
  updateJurorStake(jurorAddress, court.id, KlerosCore.bind(event.address), event.block.timestamp);
}

export function handleAcceptedFeeToken(event: AcceptedFeeToken): void {
  ensureFeeToken(event.params._token, event.address);
}
