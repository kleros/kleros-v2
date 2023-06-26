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
  Ruling,
  StakeDelayed,
} from "../generated/KlerosCore/KlerosCore";
import { ZERO, ONE } from "./utils";
import { createCourtFromEvent, getFeeForJuror } from "./entities/Court";
import { createDisputeKitFromEvent, filterSupportedDisputeKits } from "./entities/DisputeKit";
import { createDisputeFromEvent } from "./entities/Dispute";
import { createRoundFromRoundInfo } from "./entities/Round";
import { updateCases, updatePaidETH, updateRedistributedPNK, updateCasesRuled, updateCasesVoting } from "./datapoint";
import { addUserActiveDispute, ensureUser, resolveUserDispute } from "./entities/User";
import { updateJurorDelayedStake, updateJurorStake } from "./entities/JurorTokensPerCourt";
import { createDrawFromEvent } from "./entities/Draw";
import { createTokenAndEthShiftFromEvent } from "./entities/TokenAndEthShift";
import { updateArbitrableCases } from "./entities/Arbitrable";
import { Court, Dispute } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { updatePenalty } from "./entities/Penalty";

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
  createRoundFromRoundInfo(disputeID, ZERO, court.feeForJuror, roundInfo);
  const arbitrable = event.params._arbitrable.toHexString();
  updateArbitrableCases(arbitrable, ONE);
  updateCases(ONE, event.block.timestamp);
}

export function handleNewPeriod(event: NewPeriod): void {
  const disputeID = event.params._disputeID.toString();
  const dispute = Dispute.load(disputeID);
  if (!dispute) return;
  const newPeriod = getPeriodName(event.params._period);
  if (dispute.period === "vote") {
    updateCasesVoting(BigInt.fromI32(-1), event.block.timestamp);
  } else if (newPeriod === "vote") {
    updateCasesVoting(ONE, event.block.timestamp);
  }
  dispute.period = newPeriod;
  dispute.lastPeriodChange = event.block.timestamp;
  dispute.save();
}

export function handleRuling(event: Ruling): void {
  const disputeID = event.params._disputeID.toString();
  const dispute = Dispute.load(disputeID);
  if (!dispute) return;
  dispute.ruled = true;
  dispute.save();
  updateCasesRuled(ONE, event.block.timestamp);
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
  const feeForJuror = getFeeForJuror(dispute.court);
  const roundInfo = contract.getRoundInfo(disputeID, newRoundIndex);
  createRoundFromRoundInfo(disputeID, newRoundIndex, feeForJuror, roundInfo);
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

export function handleStakeDelayed(event: StakeDelayed): void {
  updateJurorDelayedStake(event.params._address.toString(), event.params._courtID.toString(), event.params._amount);
}

export function handleTokenAndETHShift(event: TokenAndETHShiftEvent): void {
  createTokenAndEthShiftFromEvent(event);
  const jurorAddress = event.params._account.toHexString();
  const disputeID = event.params._disputeID.toString();
  const pnkAmount = event.params._pnkAmount;
  const feeAmount = event.params._feeAmount;
  const dispute = Dispute.load(disputeID);
  if (!dispute) return;
  const court = Court.load(dispute.court);
  if (!court) return;
  updateJurorStake(jurorAddress, court.id, KlerosCore.bind(event.address), event.block.timestamp);
  resolveUserDispute(jurorAddress, pnkAmount, disputeID);
  court.paidETH = court.paidETH.plus(feeAmount);
  if (pnkAmount.gt(ZERO)) {
    court.paidPNK = court.paidPNK.plus(pnkAmount);
    updateRedistributedPNK(pnkAmount, event.block.timestamp);
  }
  updatePaidETH(feeAmount, event.block.timestamp);
  updatePenalty(event);
  court.save();
}
