import { BigInt } from "@graphprotocol/graph-ts";
import {
  DisputeKitClassic,
  Evidence as EvidenceEvent,
  Justification as JustificationEvent,
} from "../generated/DisputeKitClassic/DisputeKitClassic";
import {
  Dispute,
  Round,
  Evidence,
  EvidenceGroup,
  Vote,
} from "../generated/schema";

export function handleEvidenceEvent(event: EvidenceEvent): void {
  const evidenceGroupID = event.params._evidenceGroupID;
  let evidenceGroup = EvidenceGroup.load(evidenceGroupID.toString());
  if (!evidenceGroup) {
    evidenceGroup = new EvidenceGroup(evidenceGroupID.toString());
    evidenceGroup.lastEvidenceID = BigInt.fromI32(0);
  }
  const evidenceID = evidenceGroup.lastEvidenceID.plus(BigInt.fromI32(1));
  const evidence = new Evidence(`${evidenceGroupID}-${evidenceID}`);
  evidence.evidence = event.params._evidence;
  evidence.evidenceGroup = evidenceGroupID.toString();
  evidence.sender = event.params._party;
  evidenceGroup.lastEvidenceID = evidenceID;
  evidenceGroup.save();
  evidence.save();
}

export function handleJustificationEvent(event: JustificationEvent): void {
  const disputeID = event.params._coreDisputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (dispute) {
    const currentRoundIndex = dispute.currentRound;
    const currentRound = Round.load(
      `${disputeID.toString()}-${currentRoundIndex.toString()}`
    );
    if (currentRound) {
      const contract = DisputeKitClassic.bind(event.address);
      currentRound.totalVoted = contract.getRoundInfo(
        disputeID,
        BigInt.fromI32(dispute.currentRound),
        BigInt.fromI32(0)
      ).value2;
      currentRound.currentDecision = contract.currentRuling(disputeID);
      currentRound.save();
      const juror = event.params._juror.toHexString();
      const vote = new Vote(
        `${disputeID.toString()}-${currentRoundIndex.toString()}-${juror}`
      );
      vote.dispute = disputeID.toString();
      vote.round = `${disputeID.toString()}-${currentRoundIndex.toString()}`;
      vote.juror = juror;
      vote.choice = event.params._choice;
      vote.justification = event.params._justification;
      vote.save();
    }
  }
}
