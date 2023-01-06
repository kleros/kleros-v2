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
} from "../generated/KlerosCore/KlerosCore";
import { ZERO, ONE } from "./utils";
import {
  createCourtFromEvent,
  getFeeForJuror,
  loadCourtWithLog,
} from "./entities/Court";
import {
  createDisputeKitFromEvent,
  filterSupportedDisputeKits,
} from "./entities/DisputeKit";
import { createDisputeFromEvent, loadDisputeWithLog } from "./entities/Dispute";
import { createRoundFromRoundInfo } from "./entities/Round";
import {
  updateCases,
  updatePaidETH,
  updateStakedPNK,
  updateRedistributedPNK,
  getDelta,
} from "./datapoint";
import { ensureUser } from "./entities/Juror";
import {
  ensureJurorTokensPerCourt,
  updateJurorStake,
} from "./entities/JurorTokensPerCourt";
import { createDrawFromEvent } from "./entities/Draw";
import { createTokenAndEthShiftFromEvent } from "./entities/TokenAndEthShift";

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
  const court = loadCourtWithLog(event.params._courtID.toString());
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
  const court = loadCourtWithLog(event.params._courtID.toString());
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
  const court = loadCourtWithLog(courtID);
  if (!court) return;
  court.numberDisputes = court.numberDisputes.plus(ONE);
  court.save();
  createDisputeFromEvent(event);
  const roundInfo = contract.getRoundInfo(disputeID, ZERO);
  createRoundFromRoundInfo(disputeID, ZERO, court.feeForJuror, roundInfo);
  updateCases(ONE, event.block.timestamp);
}

export function handleNewPeriod(event: NewPeriod): void {
  const disputeID = event.params._disputeID.toString();
  const dispute = loadDisputeWithLog(disputeID);
  if (!dispute) return;
  dispute.period = getPeriodName(event.params._period);
  dispute.lastPeriodChange = event.block.timestamp;
  dispute.save();
}

export function handleAppealDecision(event: AppealDecision): void {
  const contract = KlerosCore.bind(event.address);
  const disputeID = event.params._disputeID;
  const dispute = loadDisputeWithLog(disputeID.toString());
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
  const dispute = loadDisputeWithLog(disputeID);
  if (!dispute) return;
  const contract = KlerosCore.bind(event.address);
  updateJurorStake(
    event.params._address.toHexString(),
    dispute.court,
    contract,
    event.block.timestamp
  );
}

export function handleStakeSet(event: StakeSet): void {
  const jurorAddress = event.params._address.toHexString();
  ensureUser(jurorAddress);
  const courtID = event.params._courtID;
  let jurorTokens = ensureJurorTokensPerCourt(jurorAddress, courtID.toString());
  const previousStake = jurorTokens.staked;

  updateJurorStake(
    jurorAddress,
    courtID.toString(),
    KlerosCore.bind(event.address),
    event.block.timestamp
  );

  const amountStaked = event.params._newTotalStake;

  updateStakedPNK(getDelta(previousStake, amountStaked), event.block.timestamp);
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
  const dispute = loadDisputeWithLog(disputeID);
  if (!dispute) return;
  const court = loadCourtWithLog(dispute.court);
  if (!court) return;
  updateJurorStake(
    jurorAddress,
    court.id,
    KlerosCore.bind(event.address),
    event.block.timestamp
  );
  court.paidETH = court.paidETH.plus(ethAmount);
  court.paidPNK = court.paidETH.plus(tokenAmount);
  court.save();
}
