import { BigInt } from "@graphprotocol/graph-ts";
import {
  DisputeKitClassic,
  DisputeCreation,
  Evidence as EvidenceEvent,
  Justification as JustificationEvent,
  Contribution as ContributionEvent,
  ChoiceFunded,
  Withdrawal,
} from "../generated/DisputeKitClassic/DisputeKitClassic";
import { KlerosCore } from "../generated/KlerosCore/KlerosCore";
import { ClassicEvidence } from "../generated/schema";
import { ensureClassicContributionFromEvent } from "./entities/ClassicContribution";
import {
  createClassicDisputeFromEvent,
  loadClassicDisputeWithLog,
} from "./entities/ClassicDispute";
import { ensureClassicEvidenceGroup } from "./entities/ClassicEvidenceGroup";
import {
  createClassicRound,
  loadClassicRoundWithLog,
  updateChoiceFundingFromContributionEvent,
} from "./entities/ClassicRound";
import { createClassicVote } from "./entities/ClassicVote";
import { loadDisputeWithLog } from "./entities/Dispute";
import { ONE } from "./utils";

export const DISPUTEKIT_ID = "1";

export function handleDisputeCreation(event: DisputeCreation): void {
  const dispute = loadDisputeWithLog(event.params._coreDisputeID.toString());
  if (!dispute) return;
  createClassicDisputeFromEvent(event);
  createClassicRound(dispute.id, dispute.currentRoundIndex);
}

export function handleEvidenceEvent(event: EvidenceEvent): void {
  const evidenceGroupID = event.params._evidenceGroupID.toHexString();
  const evidenceGroup = ensureClassicEvidenceGroup(evidenceGroupID);
  const evidenceIndex = evidenceGroup.nextEvidenceIndex;
  evidenceGroup.nextEvidenceIndex = evidenceGroup.nextEvidenceIndex.plus(ONE);
  evidenceGroup.save();
  const evidence = new ClassicEvidence(
    `${evidenceGroupID}-${evidenceIndex.toString()}`
  );
  evidence.evidence = event.params._evidence;
  evidence.evidenceGroup = evidenceGroupID.toString();
  evidence.sender = event.params._party.toHexString();
  evidence.save();
}

export function handleJustificationEvent(event: JustificationEvent): void {
  const coreDisputeID = event.params._coreDisputeID.toString();
  const classicDisputeID = `${DISPUTEKIT_ID}-${coreDisputeID}`;
  const classicDispute = loadClassicDisputeWithLog(classicDisputeID);
  if (!classicDispute) return;
  const currentLocalRoundID = `${
    classicDispute.id
  }-${classicDispute.currentLocalRoundIndex.toString()}`;
  createClassicVote(currentLocalRoundID, event);
}

export function handleContributionEvent(event: ContributionEvent): void {
  ensureClassicContributionFromEvent(event);
  updateChoiceFundingFromContributionEvent(event);
}

export function handleChoiceFunded(event: ChoiceFunded): void {
  const coreDisputeID = event.params._coreDisputeID.toString();
  const coreRoundIndex = event.params._coreRoundID.toString();
  const roundID = `${DISPUTEKIT_ID}-${coreDisputeID}-${coreRoundIndex}`;

  const localRound = loadClassicRoundWithLog(roundID);
  if (!localRound) return;

  const currentFeeRewards = localRound.feeRewards;
  const deltaFeeRewards = localRound.paidFees[event.params._choice.toI32()];
  localRound.feeRewards = currentFeeRewards.plus(deltaFeeRewards);
  const choice = event.params._choice;
  localRound.fundedChoices = localRound.fundedChoices.concat([choice]);

  if (localRound.fundedChoices.length > 1) {
    const disputeKitClassic = DisputeKitClassic.bind(event.address);
    const klerosCore = KlerosCore.bind(disputeKitClassic.core());
    const appealCost = klerosCore.appealCost(BigInt.fromString(coreDisputeID));
    localRound.feeRewards = localRound.feeRewards.minus(appealCost);

    const localDispute = loadClassicDisputeWithLog(
      `${DISPUTEKIT_ID}-${coreDisputeID}`
    );
    if (!localDispute) return;
    const newRoundIndex = localDispute.currentLocalRoundIndex.plus(ONE);
    createClassicRound(coreDisputeID, newRoundIndex);
  }

  localRound.save();
}

export function handleWithdrawal(event: Withdrawal): void {
  const contribution = ensureClassicContributionFromEvent(event);
  if (!contribution) return;
  contribution.rewardWithdrawn = true;
  contribution.save();
}
