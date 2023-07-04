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
import { ClassicDispute, ClassicEvidence, ClassicRound } from "../generated/schema";
import { ensureClassicContributionFromEvent } from "./entities/ClassicContribution";
import { createClassicDisputeFromEvent } from "./entities/ClassicDispute";
import { ensureClassicEvidenceGroup } from "./entities/ClassicEvidenceGroup";
import { createClassicRound, updateChoiceFundingFromContributionEvent, updateCounts } from "./entities/ClassicRound";
import { createClassicVote } from "./entities/ClassicVote";
import { ensureUser } from "./entities/User";
import { ONE, ZERO } from "./utils";

export const DISPUTEKIT_ID = "1";

export function handleDisputeCreation(event: DisputeCreation): void {
  const disputeID = event.params._coreDisputeID.toString();
  createClassicDisputeFromEvent(event);
  const numberOfChoices = event.params._numberOfChoices;
  createClassicRound(disputeID, numberOfChoices, ZERO);
}

export function handleEvidenceEvent(event: EvidenceEvent): void {
  const evidenceGroupID = event.params._externalDisputeID.toString();
  const evidenceGroup = ensureClassicEvidenceGroup(evidenceGroupID);
  const evidenceIndex = evidenceGroup.nextEvidenceIndex;
  evidenceGroup.nextEvidenceIndex = evidenceGroup.nextEvidenceIndex.plus(ONE);
  evidenceGroup.save();
  const evidence = new ClassicEvidence(`${evidenceGroupID}-${evidenceIndex.toString()}`);
  const userId = event.params._party.toHexString();
  evidence.evidence = event.params._evidence;
  evidence.evidenceGroup = evidenceGroupID.toString();
  evidence.sender = userId;
  ensureUser(userId);
  evidence.save();
}

export function handleJustificationEvent(event: JustificationEvent): void {
  const coreDisputeID = event.params._coreDisputeID.toString();
  const classicDisputeID = `${DISPUTEKIT_ID}-${coreDisputeID}`;
  const classicDispute = ClassicDispute.load(classicDisputeID);
  if (!classicDispute) return;
  const currentLocalRoundID = classicDispute.id + "-" + classicDispute.currentLocalRoundIndex.toString();
  updateCounts(currentLocalRoundID, event.params._choice);
  createClassicVote(currentLocalRoundID, event);
}

export function handleContributionEvent(event: ContributionEvent): void {
  ensureClassicContributionFromEvent(event);
  updateChoiceFundingFromContributionEvent(event);
}

export function handleChoiceFunded(event: ChoiceFunded): void {
  const coreDisputeID = event.params._coreDisputeID.toString();
  const coreRoundIndex = event.params._coreRoundID.toString();
  const choice = event.params._choice;
  const roundID = `${DISPUTEKIT_ID}-${coreDisputeID}-${coreRoundIndex}`;

  const localRound = ClassicRound.load(roundID);
  if (!localRound) return;

  const currentFeeRewards = localRound.feeRewards;
  const deltaFeeRewards = localRound.paidFees[choice.toI32()];
  localRound.feeRewards = currentFeeRewards.plus(deltaFeeRewards);
  localRound.fundedChoices = localRound.fundedChoices.concat([choice]);

  if (localRound.fundedChoices.length > 1) {
    const disputeKitClassic = DisputeKitClassic.bind(event.address);
    const klerosCore = KlerosCore.bind(disputeKitClassic.core());
    const appealCost = klerosCore.appealCost(BigInt.fromString(coreDisputeID));
    localRound.feeRewards = localRound.feeRewards.minus(appealCost);

    const localDispute = ClassicDispute.load(`${DISPUTEKIT_ID}-${coreDisputeID}`);
    if (!localDispute) return;
    const newRoundIndex = localDispute.currentLocalRoundIndex.plus(ONE);
    const numberOfChoices = localDispute.numberOfChoices;
    createClassicRound(coreDisputeID, numberOfChoices, newRoundIndex);
  }

  localRound.save();
}

export function handleWithdrawal(event: Withdrawal): void {
  const contribution = ensureClassicContributionFromEvent(event);
  if (!contribution) return;
  contribution.rewardWithdrawn = true;
  contribution.save();
}
