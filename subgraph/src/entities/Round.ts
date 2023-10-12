import { BigInt } from "@graphprotocol/graph-ts";
import { KlerosCore__getRoundInfoResultValue0Struct } from "../../generated/KlerosCore/KlerosCore";
import { Round } from "../../generated/schema";

export function createRoundFromRoundInfo(
  disputeID: BigInt,
  roundIndex: BigInt,
  roundInfo: KlerosCore__getRoundInfoResultValue0Struct
): void {
  const roundID = `${disputeID.toString()}-${roundIndex.toString()}`;
  const round = new Round(roundID);
  const feeToken = roundInfo.feeToken.toHexString();
  round.feeToken = feeToken === "0x0000000000000000000000000000000000000000" ? null : feeToken;
  round.disputeKit = roundInfo.disputeKitID.toString();
  round.tokensAtStakePerJuror = roundInfo.pnkAtStakePerJuror;
  round.totalFeesForJurors = roundInfo.totalFeesForJurors;
  round.nbVotes = roundInfo.nbVotes;
  round.repartitions = roundInfo.repartitions;
  round.penalties = roundInfo.pnkPenalties;
  round.dispute = disputeID.toString();
  round.save();
}
