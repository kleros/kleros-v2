import { BigInt } from "@graphprotocol/graph-ts";
import { KlerosCore__getRoundInfoResult } from "../../generated/KlerosCore/KlerosCore";
import { Round } from "../../generated/schema";

export function createRoundFromRoundInfo(
  disputeID: BigInt,
  roundIndex: BigInt,
  roundInfo: KlerosCore__getRoundInfoResult
): void {
  const roundID = `${disputeID.toString()}-${roundIndex.toString()}`;
  const round = new Round(roundID);
  const feeToken = roundInfo.getFeeToken();
  round.disputeKit = roundInfo.getDisputeKitID.toString();
  round.tokensAtStakePerJuror = roundInfo.getPnkAtStakePerJuror();
  round.totalFeesForJurors = roundInfo.getTotalFeesForJurors();
  round.nbVotes = roundInfo.getNbVotes();
  round.repartitions = roundInfo.getRepartitions();
  round.penalties = roundInfo.getPnkPenalties();
  round.dispute = disputeID.toString();
  round.feeToken =
    feeToken.toHexString() === "0x0000000000000000000000000000000000000000" ? null : feeToken.toHexString();
  round.save();
}
