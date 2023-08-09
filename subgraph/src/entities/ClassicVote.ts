import { BigInt } from "@graphprotocol/graph-ts";
import { ClassicVote, Dispute } from "../../generated/schema";

export function ensureClassicVote(
  localRoundID: string,
  juror: string,
  voteID: BigInt,
  coreDispute: Dispute
): ClassicVote {
  const id = `${localRoundID}-${voteID}`;
  const classicVote = ClassicVote.load(id);
  if (classicVote) return classicVote;

  return createClassicVote(id, juror, voteID, localRoundID, coreDispute);
}

export function createClassicVote(
  id: string,
  juror: string,
  voteID: BigInt,
  localRoundID: string,
  coreDispute: Dispute
): ClassicVote {
  const roundIndex = coreDispute.currentRoundIndex;
  const drawID = `${coreDispute.id}-${roundIndex.toString()}-${voteID.toString()}`;
  const classicVote = new ClassicVote(id);
  classicVote.coreDispute = coreDispute.id;
  classicVote.localRound = localRoundID;
  classicVote.juror = juror;
  classicVote.draw = drawID;
  classicVote.voted = false;
  classicVote.commited = false;

  classicVote.save();
  return classicVote;
}
