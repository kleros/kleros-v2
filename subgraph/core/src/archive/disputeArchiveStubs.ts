import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Arbitrable, Court, Dispute, DisputeKit, Round } from "../../generated/schema";
import { ONE, ZERO } from "../utils";
import { updateCases, updateCasesRuled, updateCourtCumulativeMetric } from "../datapoint";

const ARCHIVE_STUB_DISPUTE_KIT_ID = "archive-stub-dispute-kit";
const ARCHIVE_STUB_ARBITRABLE_ID = "0x0000000000000000000000000000000000000000";

function ensureArchiveStubDisputeKit(): void {
  if (DisputeKit.load(ARCHIVE_STUB_DISPUTE_KIT_ID) != null) {
    return;
  }
  const disputeKit = new DisputeKit(ARCHIVE_STUB_DISPUTE_KIT_ID);
  disputeKit.address = null;
  disputeKit.needsFreezing = false;
  disputeKit.save();
}

function ensureArchiveStubArbitrable(): void {
  if (Arbitrable.load(ARCHIVE_STUB_ARBITRABLE_ID) != null) {
    return;
  }
  const arbitrable = new Arbitrable(ARCHIVE_STUB_ARBITRABLE_ID);
  arbitrable.totalDisputes = ZERO;
  arbitrable.save();
}

// creates placeholder entities
export function ensureArchiveStubEntities(): void {
  ensureArchiveStubDisputeKit();
  ensureArchiveStubArbitrable();
}

function ensureArchiveCourt(courtId: BigInt): Court {
  const court = Court.load(courtId.toString());

  if (court) {
    return court;
  }
  const newCourt = new Court(courtId.toString());
  newCourt.hiddenVotes = false;
  newCourt.parent = null;
  newCourt.minStake = ZERO;
  newCourt.alpha = ZERO;
  newCourt.feeForJuror = ZERO;
  newCourt.jurorsForCourtJump = ZERO;
  newCourt.timesPerPeriod = [ZERO, ZERO, ZERO, ZERO];
  newCourt.supportedDisputeKits = [ARCHIVE_STUB_DISPUTE_KIT_ID];
  newCourt.numberDisputes = ZERO;
  newCourt.numberClosedDisputes = ZERO;
  newCourt.numberVotingDisputes = ZERO;
  newCourt.numberAppealingDisputes = ZERO;
  newCourt.numberVotes = ZERO;
  newCourt.numberStakedJurors = ZERO;
  newCourt.effectiveNumberStakedJurors = ZERO;
  newCourt.stake = ZERO;
  newCourt.effectiveStake = ZERO;
  newCourt.delayedStake = ZERO;
  newCourt.paidETH = ZERO;
  newCourt.paidPNK = ZERO;
  newCourt.eligibility = "0x";
  newCourt.save();

  return newCourt;
}

export function createArchiveOnlyDispute(
  disputeId: BigInt,
  courtId: BigInt,
  cid: string,
  reason: string | null,
  blockTimestamp: BigInt,
  blockNumber: BigInt,
  transactionHash: Bytes
): void {
  ensureArchiveStubEntities();
  updateCases(ONE, blockTimestamp);
  updateCasesRuled(ONE, blockTimestamp);

  const court = ensureArchiveCourt(courtId);
  court.numberDisputes = court.numberDisputes.plus(ONE);
  // archived dispute is closed already
  court.numberClosedDisputes = court.numberClosedDisputes.plus(ONE);
  updateCourtCumulativeMetric(courtId.toString(), ONE, blockTimestamp, "numberDisputes");

  // placeholder for currentRound, actual data is fetched from ipfs
  const currentRoundId = disputeId.toString() + "-0";
  const currentRound = Round.load(currentRoundId);

  if (!currentRound) {
    const round = new Round(currentRoundId);
    round.dispute = disputeId.toString();
    round.court = court.id;
    round.disputeKit = ARCHIVE_STUB_DISPUTE_KIT_ID;
    round.tokensAtStakePerJuror = ZERO;
    round.totalFeesForJurors = ZERO;
    round.nbVotes = ZERO;
    round.isCurrentRound = true;
    round.repartitions = ZERO;
    round.penalties = ZERO;
    round.timeline = [ZERO, ZERO, ZERO, ZERO];
    round.jurorsDrawn = false;
    round.jurorRewardsDispersed = false;
    round.timesPerPeriod = [ZERO, ZERO, ZERO, ZERO];
    round.hiddenVotes = false;
    round.jurorsForCourtJump = ZERO;
    round.feeToken = null;
    round.save();
  }

  const dispute = new Dispute(disputeId.toString());
  dispute.disputeID = disputeId;
  dispute.court = court.id;
  dispute.createdAt = blockTimestamp;
  dispute.transactionHash = transactionHash.toHexString();
  dispute.arbitrated = ARCHIVE_STUB_ARBITRABLE_ID;
  dispute.period = "execution";
  dispute.ruled = true;
  dispute.executed = true;
  dispute.currentRuling = ZERO;
  dispute.tied = false;
  dispute.overridden = false;
  dispute.periodDeadline = blockTimestamp;
  dispute.periodNotificationIndex = ZERO;
  dispute.lastPeriodChange = blockTimestamp;
  dispute.lastPeriodChangeBlockNumber = blockNumber;
  dispute.currentRound = currentRoundId;
  dispute.currentRoundIndex = ZERO;
  dispute.evidenceCount = ZERO;
  dispute.isArchived = true;
  dispute.archiveCid = cid;
  dispute.save();
}
