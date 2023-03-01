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
} from "../generated/KlerosCore/KlerosCore";
import { ZERO, ONE } from "./utils";
import { createCourtFromEvent, getFeeForJuror } from "./entities/Court";
import {
  createDisputeKitFromEvent,
  filterSupportedDisputeKits,
} from "./entities/DisputeKit";
import { createDisputeFromEvent } from "./entities/Dispute";
import { createRoundFromRoundInfo } from "./entities/Round";
import {
  updateCases,
  updatePaidETH,
  updateStakedPNK,
  updateRedistributedPNK,
  updateCasesRuled,
  updateCasesVoting,
  getDelta,
} from "./datapoint";
import {
  addUserActiveDispute,
  ensureUser,
  resolveUserDispute,
} from "./entities/User";
import {
  ensureJurorTokensPerCourt,
  updateJurorStake,
} from "./entities/JurorTokensPerCourt";
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
  const contract = KlerosCore.bind(event.address);
  const courtContractState = contract.courts(event.params._courtID);
  const court = Court.load(event.params._courtID.toString());
  if (!court) return;
  court.hiddenVotes = courtContractState.value1;
  court.minStake = courtContractState.value2;
  court.alpha = courtContractState.value3;
  court.feeForJuror = courtContractState.value4;
  court.jurorsForCourtJump = courtContractState.value5;
  court.timesPerPeriod = contract.getTimesPerPeriod(event.params._courtID);
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
  updateJurorStake(
    jurorAddress,
    dispute.court,
    contract,
    event.block.timestamp
  );
  addUserActiveDispute(jurorAddress, disputeID);
}

export function handleStakeSet(event: StakeSet): void {
  const jurorAddress = event.params._address.toHexString();
  ensureUser(jurorAddress);
  const courtID = event.params._courtID;

  updateJurorStake(
    jurorAddress,
    courtID.toString(),
    KlerosCore.bind(event.address),
    event.block.timestamp
  );
}

export function handleTokenAndETHShift(event: TokenAndETHShiftEvent): void {
  createTokenAndEthShiftFromEvent(event);
  const jurorAddress = event.params._account.toHexString();
  const disputeID = event.params._disputeID.toString();
  const tokenAmount = event.params._tokenAmount;
  const ethAmount = event.params._ethAmount;
  if (tokenAmount.gt(ZERO)) {
    updateRedistributedPNK(tokenAmount, event.block.timestamp);
  }
  updatePaidETH(ethAmount, event.block.timestamp);
  const dispute = Dispute.load(disputeID);
  if (!dispute) return;
  const court = Court.load(dispute.court);
  if (!court) return;
  updateJurorStake(
    jurorAddress,
    court.id,
    KlerosCore.bind(event.address),
    event.block.timestamp
  );
  resolveUserDispute(jurorAddress, tokenAmount, disputeID);
  court.paidETH = court.paidETH.plus(ethAmount);
  court.paidPNK = court.paidPNK.plus(tokenAmount);
  court.save();
  updatePenalty(event);
}
