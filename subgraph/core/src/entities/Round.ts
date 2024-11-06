import { BigInt } from "@graphprotocol/graph-ts";
import { KlerosCore, KlerosCore__getRoundInfoResultValue0Struct } from "../../generated/KlerosCore/KlerosCore";
import { Dispute, Round } from "../../generated/schema";
import { ONE } from "../utils";

export function createRoundFromRoundInfo(
  contract: KlerosCore,
  disputeID: BigInt,
  roundIndex: BigInt,
  roundInfo: KlerosCore__getRoundInfoResultValue0Struct
): void {
  const roundID = `${disputeID.toString()}-${roundIndex.toString()}`;
  const round = new Round(roundID);
  round.isCurrentRound = true;
  const feeToken = roundInfo.feeToken.toHexString();
  round.feeToken = feeToken === "0x0000000000000000000000000000000000000000" ? null : feeToken;
  round.disputeKit = roundInfo.disputeKitID.toString();
  round.tokensAtStakePerJuror = roundInfo.pnkAtStakePerJuror;
  round.totalFeesForJurors = roundInfo.totalFeesForJurors;
  round.nbVotes = roundInfo.nbVotes;
  round.repartitions = roundInfo.repartitions;
  round.penalties = roundInfo.pnkPenalties;
  round.dispute = disputeID.toString();
  const courtID = contract.disputes(disputeID).value0.toString();
  round.court = courtID;
  round.timeline = new Array<BigInt>(4).fill(new BigInt(0));
  round.jurorsDrawn = false;
  round.jurorRewardsDispersed = false;
  round.save();
}

function getIndexByPeriodName(periodName: string): i32 {
  const periodArray = ["evidence", "commit", "vote", "appeal", "execution"];
  return periodArray.indexOf(periodName);
}

export function updateRoundTimeline(disputeId: string, newPeriod: string, timestamp: BigInt): void {
  const dispute = Dispute.load(disputeId);
  if (!dispute) return;
  //explanation: this to handle new round,since AppealDecision is emitted before NewPeriod, which changes the currentRoundIndex ,
  //hence when round changes we subtract 1 from current round index
  const currentRoundIndex =
    dispute.period.includes("appeal") && newPeriod === "evidence"
      ? dispute.currentRoundIndex.minus(ONE)
      : dispute.currentRoundIndex;
  const roundID = `${disputeId}-${currentRoundIndex.toString()}`;
  const round = Round.load(roundID);
  if (!round) return;

  let timeline = round.timeline;
  const period = getIndexByPeriodName(dispute.period);
  timeline[period] = timestamp;
  round.timeline = timeline;
  round.save();
}
