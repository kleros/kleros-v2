import { BigInt } from "@graphprotocol/graph-ts";
import { KlerosCore__getRoundInfoResult } from "../../generated/KlerosCore/KlerosCore";
import { Round } from "../../generated/schema";

export function createRoundFromRoundInfo(
  disputeID: BigInt,
  roundIndex: BigInt,
  feeForJuror: BigInt,
  roundInfo: KlerosCore__getRoundInfoResult
): void {
  const roundID = `${disputeID.toString()}-${roundIndex.toString()}`;
  const round = new Round(roundID);
  round.disputeKit = roundInfo.value5.toString();
  round.tokensAtStakePerJuror = roundInfo.value0;
  round.totalFeesForJurors = roundInfo.value1;
  round.nbVotes = roundInfo.value1.div(feeForJuror);
  round.repartitions = roundInfo.value2;
  round.penalties = roundInfo.value3;
  round.dispute = disputeID.toString();
  round.save();
}
