import {
  KlerosCore,
  AppealDecision,
  DisputeCreation,
  DisputeKitCreated,
  DisputeKitEnabled,
  CourtCreated,
  CourtModified,
  Draw as DrawEvent,
  NewPeriod,
  TokenAndETHShift as TokenAndETHShiftEvent,
  CourtJump,
  Ruling,
  AcceptedFeeToken,
} from "../generated/KlerosCore/KlerosCore";
import { ZERO, ONE } from "./utils";
import { createCourtFromEvent } from "./entities/Court";
import { createDisputeKitFromEvent, filterSupportedDisputeKits } from "./entities/DisputeKit";
import { createDisputeFromEvent } from "./entities/Dispute";
import { createRoundFromRoundInfo, updateRoundTimeline } from "./entities/Round";
import { updateCases, updateCasesAppealing, updateCasesRuled, updateCasesVoting } from "./datapoint";
import { addUserActiveDispute, ensureUser } from "./entities/User";
import { updateJurorStake } from "./entities/JurorTokensPerCourt";
import { createDrawFromEvent } from "./entities/Draw";
import { updateTokenAndEthShiftFromEvent } from "./entities/TokenAndEthShift";
import { updateArbitrableCases } from "./entities/Arbitrable";
import { ClassicVote, Court, Dispute, Draw, Round, User } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { updatePenalty } from "./entities/Penalty";
import { ensureFeeToken } from "./entities/FeeToken";
import { getAndIncrementPeriodCounter } from "./entities/PeriodIndexCounter";
import { SortitionModule } from "../generated/SortitionModule/SortitionModule";

function getPeriodName(index: i32): string {
  const periodArray = ["evidence", "commit", "vote", "appeal", "execution"];
  return periodArray.at(index) || "None";
}

export function handleCourtCreated(event: CourtCreated): void {
  createCourtFromEvent(event);
}

export function handleCourtModified(event: CourtModified): void {
  const court = Court.load(event.params._courtID.toString());
  if (!court) return;
  court.hiddenVotes = event.params._hiddenVotes;
  court.minStake = event.params._minStake;
  court.alpha = event.params._alpha;
  court.feeForJuror = event.params._feeForJuror;
  court.jurorsForCourtJump = event.params._jurorsForCourtJump;
  court.timesPerPeriod = event.params._timesPerPeriod;
  court.save();
}

export function handleDisputeKitCreated(event: DisputeKitCreated): void {
  createDisputeKitFromEvent(event);
}

export function handleDisputeKitEnabled(event: DisputeKitEnabled): void {
  const court = Court.load(event.params._courtID.toString());
  if (!court) return;
  const isEnable = event.params._enable;
  const disputeKitID = event.params._disputeKitID.toString();
  court.supportedDisputeKits = isEnable
    ? court.supportedDisputeKits.concat([disputeKitID])
    : filterSupportedDisputeKits(court.supportedDisputeKits, disputeKitID);
  court.save();
}

export function handleDisputeCreation(event: DisputeCreation): void {
  const contract = KlerosCore.bind(event.address);
  const disputeID = event.params._disputeID;
  const disputeStorage = contract.disputes(disputeID);
  const courtID = disputeStorage.value0.toString();
  const court = Court.load(courtID);
  if (!court) return;
  court.numberDisputes = court.numberDisputes.plus(ONE);
  court.save();
  createDisputeFromEvent(event);
  const roundInfo = contract.getRoundInfo(disputeID, ZERO);
  createRoundFromRoundInfo(KlerosCore.bind(event.address), disputeID, ZERO, roundInfo);
  const arbitrable = event.params._arbitrable.toHexString();
  updateArbitrableCases(arbitrable, ONE);
  updateCases(ONE, event.block.timestamp);
}

export function handleNewPeriod(event: NewPeriod): void {
  const disputeID = event.params._disputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (!dispute) return;
  const court = Court.load(dispute.court);
  if (!court) return;

  if (dispute.period.includes("vote")) {
    court.numberVotingDisputes = court.numberVotingDisputes.minus(ONE);
    updateCasesVoting(BigInt.fromI32(-1), event.block.timestamp);
  } else if (dispute.period.includes("appeal")) {
    let juror: User;
    for (let i = 0; i < dispute.jurors.entries.length; i++) {
      juror = ensureUser(dispute.jurors.entries[i].value.toString());
      juror.totalAppealingDisputes = juror.totalAppealingDisputes.minus(ONE);
      juror.save();
    }
    court.numberAppealingDisputes = court.numberAppealingDisputes.minus(ONE);
    updateCasesAppealing(BigInt.fromI32(-1), event.block.timestamp);
  }

  const newPeriod = getPeriodName(event.params._period);
  if (newPeriod === "vote") {
    court.numberVotingDisputes = court.numberVotingDisputes.plus(ONE);
    updateCasesVoting(ONE, event.block.timestamp);
  } else if (newPeriod === "appeal") {
    let juror: User;
    for (let i = 0; i < dispute.jurors.entries.length; i++) {
      juror = ensureUser(dispute.jurors.entries[i].value.toString());
      juror.totalAppealingDisputes = juror.totalAppealingDisputes.plus(ONE);
      juror.save();
    }
    court.numberAppealingDisputes = court.numberAppealingDisputes.plus(ONE);
    updateCasesAppealing(ONE, event.block.timestamp);
  } else if (newPeriod === "execution") {
    const contract = KlerosCore.bind(event.address);
    const currentRulingInfo = contract.currentRuling(disputeID);
    dispute.currentRuling = currentRulingInfo.getRuling();
    dispute.overridden = currentRulingInfo.getOverridden();
    dispute.tied = currentRulingInfo.getTied();
    dispute.save();

    const rounds = dispute.rounds.load();
    for (let i = 0; i < rounds.length; i++) {
      const round = Round.load(rounds[i].id);
      if (!round) continue;

      const draws = round.drawnJurors.load();
      // Iterate over all draws in the round
      for (let j = 0; j < draws.length; j++) {
        const draw = Draw.load(draws[j].id);
        if (!draw) continue;

        // This will only work for Classic DisputeKit ("1-").
        const vote = ClassicVote.load(`1-${draw.id}`);

        if (!vote) continue;

        const juror = ensureUser(draw.juror);
        juror.totalResolvedVotes = juror.totalResolvedVotes.plus(ONE);

        if (vote.choice === null) continue;

        // Check if the vote choice matches the final ruling
        if (vote.choice!.equals(dispute.currentRuling)) {
          juror.totalCoherentVotes = juror.totalCoherentVotes.plus(ONE);
        }

        // Recalculate coherenceScore
        if (juror.totalResolvedVotes.gt(ZERO)) {
          const coherenceScore = juror.totalCoherentVotes.times(BigInt.fromI32(100)).div(juror.totalResolvedVotes);
          juror.coherenceScore = coherenceScore;
        }

        juror.save();
      }
    }
  }

  dispute.period = newPeriod;
  dispute.lastPeriodChange = event.block.timestamp;
  dispute.lastPeriodChangeBlockNumber = event.block.number;
  dispute.periodNotificationIndex = getAndIncrementPeriodCounter(newPeriod);
  if (newPeriod !== "execution") {
    dispute.periodDeadline = event.block.timestamp.plus(court.timesPerPeriod[event.params._period]);
  } else {
    dispute.periodDeadline = BigInt.fromU64(U64.MAX_VALUE);
  }
  updateRoundTimeline(disputeID.toString(), newPeriod, event.block.timestamp);
  dispute.save();
  court.save();
}

export function handleRuling(event: Ruling): void {
  updateCasesRuled(ONE, event.block.timestamp);
  const disputeID = event.params._disputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (!dispute) return;
  dispute.ruled = true;
  dispute.save();
  const court = Court.load(dispute.court);
  if (!court) return;
  court.numberClosedDisputes = court.numberClosedDisputes.plus(ONE);
  court.save();
}

export function handleAppealDecision(event: AppealDecision): void {
  const contract = KlerosCore.bind(event.address);
  const disputeID = event.params._disputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (!dispute) return;
  const newRoundIndex = dispute.currentRoundIndex.plus(ONE);
  const roundID = `${disputeID}-${newRoundIndex.toString()}`;
  dispute.currentRoundIndex = newRoundIndex;
  dispute.currentRound = roundID;
  dispute.save();
  const roundInfo = contract.getRoundInfo(disputeID, newRoundIndex);
  createRoundFromRoundInfo(KlerosCore.bind(event.address), disputeID, newRoundIndex, roundInfo);
}

export function handleCourtJump(event: CourtJump): void {
  const dispute = Dispute.load(event.params._disputeID.toString());
  if (!dispute) return;
  dispute.court = event.params._toCourtID.toString();
  dispute.save();
}

export function handleDraw(event: DrawEvent): void {
  createDrawFromEvent(event);
  const disputeID = event.params._disputeID.toString();
  const dispute = Dispute.load(disputeID);
  if (!dispute) return;
  const klerosCore = KlerosCore.bind(event.address);
  const sortitionModule = SortitionModule.bind(klerosCore.sortitionModule());

  const jurorAddress = event.params._address.toHexString();
  updateJurorStake(jurorAddress, dispute.court, sortitionModule, event.block.timestamp);
  addUserActiveDispute(jurorAddress, disputeID);

  const roundIndex = event.params._roundID;
  const roundID = `${disputeID}-${roundIndex.toString()}`;

  const currentRound = Round.load(roundID);
  if (!currentRound) return;

  if (currentRound.nbVotes.toI32() === currentRound.drawnJurors.load().length) {
    currentRound.jurorsDrawn = true;
    currentRound.save();
  }
}

export function handleTokenAndETHShift(event: TokenAndETHShiftEvent): void {
  updatePenalty(event);
  updateTokenAndEthShiftFromEvent(event);
  const jurorAddress = event.params._account.toHexString();
  const disputeID = event.params._disputeID.toString();
  const dispute = Dispute.load(disputeID);
  if (!dispute) return;
  const court = Court.load(dispute.court);
  if (!court) return;
  const klerosCore = KlerosCore.bind(event.address);
  const sortitionModule = SortitionModule.bind(klerosCore.sortitionModule());
  updateJurorStake(jurorAddress, court.id, sortitionModule, event.block.timestamp);

  const roundIndex = event.params._roundID;
  const roundID = `${disputeID}-${roundIndex.toString()}`;

  const round = Round.load(roundID);
  if (!round) return;

  const roundInfo = klerosCore.getRoundInfo(event.params._disputeID, roundIndex);
  const repartitions = roundInfo.repartitions;
  const nbVotes = roundInfo.nbVotes;

  if (repartitions >= nbVotes) {
    round.jurorRewardsDispersed = true;
    round.save();
  }
}

export function handleAcceptedFeeToken(event: AcceptedFeeToken): void {
  ensureFeeToken(event.params._token, event.address);
}
