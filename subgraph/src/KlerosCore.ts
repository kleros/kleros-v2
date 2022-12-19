import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ZERO } from "./utils";
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
  StakeSet,
  TokenAndETHShift as TokenAndETHShiftEvent,
} from "../generated/KlerosCore/KlerosCore";
import {
  Juror,
  TokenAndETHShift,
  JurorTokensPerCourt,
  Round,
  Draw,
  Dispute,
  DisputeKit,
  Court,
} from "../generated/schema";
import {
  updateCases,
  updateActiveJurors,
  updatePaidETH,
  updateStakedPNK,
  updateCasesRuled,
  updateCasesVoting,
  updateRedistributedPNK,
  getDelta,
} from "./datapoint";

function getPeriodName(index: i32): string {
  const periodArray = ["Evidence", "Commit", "Vote", "Appeal", "Execution"];
  return periodArray.at(index) || "None";
}

export function handleCourtCreated(event: CourtCreated): void {
  const court = new Court(event.params._courtID.toString());
  court.hiddenVotes = event.params._hiddenVotes;
  court.parent = event.params._parent.toString();
  court.minStake = event.params._minStake;
  court.alpha = event.params._alpha;
  court.feeForJuror = event.params._feeForJuror;
  court.jurorsForCourtJump = event.params._jurorsForCourtJump;
  court.timesPerPeriod = event.params._timesPerPeriod;
  court.supportedDisputeKits = event.params._supportedDisputeKits.map<string>(
    (disputeKitID: BigInt) => disputeKitID.toString()
  );
  court.numberDisputes = ZERO;
  court.numberStakedJurors = ZERO;
  court.stake = ZERO;
  court.paidETH = ZERO;
  court.paidPNK = ZERO;
  court.save();
}

export function handleCourtModified(event: CourtModified): void {
  const court = Court.load(event.params._courtID.toString());
  if (court) {
    const contract = KlerosCore.bind(event.address);
    const courtContractState = contract.courts(event.params._courtID);
    court.hiddenVotes = courtContractState.value1;
    court.minStake = courtContractState.value2;
    court.alpha = courtContractState.value3;
    court.feeForJuror = courtContractState.value4;
    court.jurorsForCourtJump = courtContractState.value5;
    court.timesPerPeriod = contract.getTimesPerPeriod(event.params._courtID);
    court.save();
  }
}

export function handleDisputeKitCreated(event: DisputeKitCreated): void {
  const disputeKit = new DisputeKit(event.params._disputeKitID.toString());
  disputeKit.parent = event.params._parent.toString();
  disputeKit.address = event.params._disputeKitAddress;
  disputeKit.needsFreezing = false;
  const parent = DisputeKit.load(event.params._parent.toString());
  disputeKit.depthLevel = parent
    ? parent.depthLevel.plus(BigInt.fromI32(1))
    : BigInt.fromI32(0);
  disputeKit.save();
}

export function handleDisputeKitEnabled(event: DisputeKitEnabled): void {
  const court = Court.load(event.params._courtID.toString());
  if (court) {
    const isEnable = event.params._enable;
    const disputeKitID = event.params._disputeKitID.toString();
    court.supportedDisputeKits = isEnable
      ? court.supportedDisputeKits.concat([disputeKitID])
      : filterSupportedDisputeKits(court.supportedDisputeKits, disputeKitID);
    court.save();
  }
}

function filterSupportedDisputeKits(
  supportedDisputeKits: string[],
  disputeKitID: string
): string[] {
  let result: string[] = [];
  for (let i = 0; i < supportedDisputeKits.length; i++)
    if (supportedDisputeKits[i] !== disputeKitID)
      result = result.concat([supportedDisputeKits[i]]);
  return result;
}

export function handleAppealDecision(event: AppealDecision): void {
  const disputeID = event.params._disputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (dispute) {
    const contract = KlerosCore.bind(event.address);
    const newRoundIndex = dispute.currentRound + 1;
    const round = new Round(
      `${disputeID.toString()}-${newRoundIndex.toString()}`
    );
    const roundInfo = contract.getRoundInfo(
      disputeID,
      BigInt.fromI64(newRoundIndex)
    );
    const courtID = dispute.courtID;
    const courtStorage = contract.courts(BigInt.fromString(courtID));
    round.dispute = disputeID.toString();
    round.tokensAtStakePerJuror = roundInfo.value0;
    round.totalFeesForJurors = roundInfo.value1;
    round.nbVotes = roundInfo.value1.div(courtStorage.value4);
    round.totalVoted = BigInt.fromI32(0);
    round.repartitions = roundInfo.value2;
    round.penalties = roundInfo.value3;
    round.disputeKitID = roundInfo.value5.toString();
    dispute.currentRound = newRoundIndex;
    round.save();
    dispute.save();
  }
}

export function handleDisputeCreation(event: DisputeCreation): void {
  const contract = KlerosCore.bind(event.address);
  const disputeID = event.params._disputeID;
  const dispute = new Dispute(disputeID.toString());
  const disputeStorage = contract.disputes(disputeID);
  const courtID = disputeStorage.value0;
  const court = Court.load(courtID.toString());
  dispute.arbitrated = event.params._arbitrable;
  dispute.courtID = courtID.toString();
  dispute.period = "Evidence";
  dispute.ruled = false;
  dispute.lastPeriodChange = disputeStorage.value4;
  dispute.currentRound = 0;
  const roundInfo = contract.getRoundInfo(disputeID, BigInt.fromString("0"));
  const round = new Round(`${disputeID.toString()}-0`);
  round.dispute = disputeID.toString();
  round.tokensAtStakePerJuror = roundInfo.value0;
  round.totalFeesForJurors = roundInfo.value1;
  round.nbVotes = court ? roundInfo.value1.div(court.feeForJuror) : ZERO;
  round.totalVoted = BigInt.fromI32(0);
  round.repartitions = roundInfo.value2;
  round.penalties = roundInfo.value3;
  round.disputeKitID = roundInfo.value5.toString();
  if (court) {
    court.numberDisputes = court.numberDisputes.plus(BigInt.fromI32(1));
  }
  dispute.save();
  round.save();
  updateCases(BigInt.fromI32(1), event.block.timestamp);
}

export function handleNewPeriod(event: NewPeriod): void {
  const disputeID = event.params._disputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (dispute) {
    dispute.period = getPeriodName(event.params._period);
    dispute.save();
  }
}

function updateJurorStake(
  jurorAddress: string,
  courtID: string,
  contract: KlerosCore,
  timestamp: BigInt
): void {
  const juror = Juror.load(jurorAddress);
  const court = Court.load(courtID);
  const jurorTokens = JurorTokensPerCourt.load(`${jurorAddress}-${courtID}`);
  if (juror && court && jurorTokens) {
    const jurorBalance = contract.getJurorBalance(
      Address.fromString(jurorAddress),
      BigInt.fromString(courtID)
    );
    const previousStake = jurorTokens.staked;
    jurorTokens.staked = jurorBalance.value0;
    jurorTokens.locked = jurorBalance.value1;
    jurorTokens.save();
    const stakeDelta = jurorTokens.staked.minus(previousStake);
    const previousTotalStake = juror.totalStake;
    juror.totalStake = juror.totalStake.plus(stakeDelta);
    court.stake = court.stake.plus(stakeDelta);
    let activeJurorsDelta: BigInt;
    let numberStakedJurorsDelta: BigInt;
    if (previousTotalStake.equals(ZERO)) {
      activeJurorsDelta = BigInt.fromI32(1);
      numberStakedJurorsDelta = BigInt.fromI32(1);
    } else if (previousStake.equals(ZERO)) {
      activeJurorsDelta = ZERO;
      numberStakedJurorsDelta = BigInt.fromI32(1);
    } else {
      activeJurorsDelta = ZERO;
      numberStakedJurorsDelta = ZERO;
    }
    court.numberStakedJurors = court.numberStakedJurors.plus(
      numberStakedJurorsDelta
    );
    updateActiveJurors(activeJurorsDelta, timestamp);
    juror.save();
    court.save();
  }
}

export function handleDraw(event: DrawEvent): void {
  const disputeID = event.params._disputeID;
  const currentRound = event.params._roundID;
  const voteID = event.params._voteID;
  const drawID = `${disputeID.toString()}-${currentRound.toString()}-${voteID.toString()}`;
  const drawnAddress = event.params._address;
  const draw = new Draw(drawID);
  draw.dispute = disputeID.toString();
  draw.round = currentRound.toString();
  draw.juror = drawnAddress.toHexString();
  draw.voteID = voteID;
  draw.save();
  const dispute = Dispute.load(disputeID.toString());
  if (dispute) {
    const contract = KlerosCore.bind(event.address);
    updateJurorStake(
      drawnAddress.toHexString(),
      dispute.courtID.toString(),
      contract,
      event.block.timestamp
    );
  }
}

export function handleStakeSet(event: StakeSet): void {
  const jurorAddress = event.params._address.toHexString();
  let juror = Juror.load(jurorAddress);
  if (!juror) {
    juror = new Juror(jurorAddress);
    updateActiveJurors(BigInt.fromI32(1), event.block.timestamp);
  }
  juror.save();
  const courtID = event.params._courtID;
  const jurorTokensID = `${jurorAddress}-${courtID.toString()}`;
  let jurorTokens = JurorTokensPerCourt.load(jurorTokensID);
  let previousStake: BigInt;
  if (!jurorTokens) {
    jurorTokens = new JurorTokensPerCourt(jurorTokensID);
    jurorTokens.juror = jurorAddress;
    jurorTokens.court = courtID.toString();
    jurorTokens.staked = ZERO;
    jurorTokens.locked = ZERO;
    jurorTokens.save();
    previousStake = ZERO;
  } else previousStake = jurorTokens.staked;
  updateJurorStake(
    jurorAddress,
    courtID.toString(),
    KlerosCore.bind(event.address),
    event.block.timestamp
  );
  const amountStaked = event.params._newTotalStake;
  updateStakedPNK(getDelta(previousStake, amountStaked), event.block.timestamp);
}

export function handleTokenAndETHShift(event: TokenAndETHShiftEvent): void {
  const jurorAddress = event.params._account.toHexString();
  const disputeID = event.params._disputeID;
  const shiftID = `${jurorAddress}-${disputeID.toString()}`;
  const tokenAmount = event.params._tokenAmount;
  const ethAmount = event.params._ethAmount;
  const shift = new TokenAndETHShift(shiftID);
  if (tokenAmount.gt(BigInt.fromI32(0))) {
    updateRedistributedPNK(tokenAmount, event.block.timestamp);
  }
  updatePaidETH(ethAmount, event.block.timestamp);
  shift.juror = jurorAddress;
  shift.dispute = disputeID.toString();
  shift.tokenAmount = tokenAmount;
  shift.ethAmount = ethAmount;
  shift.save();
  const dispute = Dispute.load(disputeID.toString());
  if (dispute) {
    const court = Court.load(dispute.courtID.toString());
    if (court) {
      updateJurorStake(
        jurorAddress,
        court.id,
        KlerosCore.bind(event.address),
        event.block.timestamp
      );
      court.paidETH = court.paidETH.plus(ethAmount);
      court.paidPNK = court.paidETH.plus(tokenAmount);
      court.save();
    }
  }
}
