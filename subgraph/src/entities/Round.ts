import { BigInt } from "@graphprotocol/graph-ts";
import { KlerosCore__getRoundInfoResult } from "../../generated/KlerosCore/KlerosCore";
import { Round } from "../../generated/schema";
import { ZERO } from "../utils";

export function ensureRound(id: string): Round {
  let round = Round.load(id);

  if (round) {
    return round;
  }
  // Should never reach here
  round = new Round(id);
  round.disputeKit = "0";
  round.tokensAtStakePerJuror = ZERO;
  round.totalFeesForJurors = ZERO;
  round.nbVotes = ZERO;
  round.repartitions = ZERO;
  round.penalties = ZERO;
  round.dispute = "0";
  round.save();

  return round;
}

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

export function filterSupportedDisputeKits(
  supportedDisputeKits: string[],
  disputeKitID: string
): string[] {
  let result: string[] = [];
  for (let i = 0; i < supportedDisputeKits.length; i++)
    if (supportedDisputeKits[i] !== disputeKitID)
      result = result.concat([supportedDisputeKits[i]]);
  return result;
}
