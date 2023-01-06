import { Justification } from "../../generated/DisputeKitClassic/DisputeKitClassic";
import { ClassicVote } from "../../generated/schema";

export function createClassicVote(
  currentRoundID: string,
  event: Justification
): void {
  const coreDisputeID = event.params._coreDisputeID.toString();
  const juror = event.params._juror.toHexString();

  const id = `${currentRoundID}-${juror}`;
  const classicVote = new ClassicVote(id);
  classicVote.coreDispute = coreDisputeID;
  classicVote.localRound = currentRoundID;
  classicVote.juror = juror;
  classicVote.choice = event.params._choice;
  classicVote.justification = event.params._justification;

  classicVote.save();
}
