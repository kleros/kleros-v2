import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ZERO } from "./utils";
import {
  KlerosCore,
  AppealDecision,
  DisputeCreation,
  DisputeKitCreated,
  DisputeKitEnabled,
  SubcourtCreated,
  SubcourtModified,
  Draw as DrawEvent,
  NewPeriod,
  StakeSet,
  TokenAndETHShift as TokenAndETHShiftEvent,
} from "../generated/KlerosCore/KlerosCore";
import {
  Juror,
  TokenAndETHShift,
  JurorTokensPerSubcourt,
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

export function handleSubcourtCreated(event: SubcourtCreated): void {
  const subcourt = new Court(event.params._subcourtID.toString());
  subcourt.hiddenVotes = event.params._hiddenVotes;
  subcourt.parent = event.params._parent.toString();
  subcourt.minStake = event.params._minStake;
  subcourt.alpha = event.params._alpha;
  subcourt.feeForJuror = event.params._feeForJuror;
  subcourt.jurorsForCourtJump = event.params._jurorsForCourtJump;
  subcourt.timesPerPeriod = event.params._timesPerPeriod;
  subcourt.supportedDisputeKits =
    event.params._supportedDisputeKits.map<string>((disputeKitID: BigInt) =>
      disputeKitID.toString()
    );
  subcourt.numberDisputes = ZERO;
  subcourt.numberStakedJurors = ZERO;
  subcourt.stake = ZERO;
  subcourt.paidETH = ZERO;
  subcourt.paidPNK = ZERO;
  subcourt.save();
}

export function handleSubcourtModified(event: SubcourtModified): void {
  const court = Court.load(event.params._subcourtID.toString());
  if (court) {
    const contract = KlerosCore.bind(event.address);
    const courtContractState = contract.courts(event.params._subcourtID);
    court.hiddenVotes = courtContractState.value1;
    court.minStake = courtContractState.value2;
    court.alpha = courtContractState.value3;
    court.feeForJuror = courtContractState.value4;
    court.jurorsForCourtJump = courtContractState.value5;
    court.timesPerPeriod = contract.getTimesPerPeriod(event.params._subcourtID);
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
  const court = Court.load(event.params._subcourtID.toString());
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
    const subcourtID = dispute.subcourtID;
    const subcourtStorage = contract.courts(BigInt.fromString(subcourtID));
    round.dispute = disputeID.toString();
    round.tokensAtStakePerJuror = roundInfo.value0;
    round.totalFeesForJurors = roundInfo.value1;
    round.nbVotes = roundInfo.value1.div(subcourtStorage.value4);
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
  const subcourtID = disputeStorage.value0;
  const subcourt = Court.load(subcourtID.toString());
  dispute.arbitrated = event.params._arbitrable;
  dispute.subcourtID = subcourtID.toString();
  dispute.period = "Evidence";
  dispute.ruled = false;
  dispute.lastPeriodChange = disputeStorage.value4;
  dispute.currentRound = 0;
  const roundInfo = contract.getRoundInfo(disputeID, BigInt.fromString("0"));
  const round = new Round(`${disputeID.toString()}-0`);
  round.dispute = disputeID.toString();
  round.tokensAtStakePerJuror = roundInfo.value0;
  round.totalFeesForJurors = roundInfo.value1;
  round.nbVotes = subcourt ? roundInfo.value1.div(subcourt.feeForJuror) : ZERO;
  round.totalVoted = BigInt.fromI32(0);
  round.repartitions = roundInfo.value2;
  round.penalties = roundInfo.value3;
  round.disputeKitID = roundInfo.value5.toString();
  if (subcourt) {
    subcourt.numberDisputes = subcourt.numberDisputes.plus(BigInt.fromI32(1));
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
  subcourtID: string,
  contract: KlerosCore,
  timestamp: BigInt
): void {
  const juror = Juror.load(jurorAddress);
  const subcourt = Court.load(subcourtID);
  const jurorTokens = JurorTokensPerSubcourt.load(
    `${jurorAddress}-${subcourtID}`
  );
  if (juror && subcourt && jurorTokens) {
    const jurorBalance = contract.getJurorBalance(
      Address.fromString(jurorAddress),
      BigInt.fromString(subcourtID)
    );
    const previousStake = jurorTokens.staked;
    jurorTokens.staked = jurorBalance.value0;
    jurorTokens.locked = jurorBalance.value1;
    jurorTokens.save();
    const stakeDelta = jurorTokens.staked.minus(previousStake);
    const previousTotalStake = juror.totalStake;
    juror.totalStake = juror.totalStake.plus(stakeDelta);
    subcourt.stake = subcourt.stake.plus(stakeDelta);
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
    subcourt.numberStakedJurors = subcourt.numberStakedJurors.plus(
      numberStakedJurorsDelta
    );
    updateActiveJurors(activeJurorsDelta, timestamp);
    juror.save();
    subcourt.save();
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
      dispute.subcourtID.toString(),
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
  const subcourtID = event.params._subcourtID;
  const jurorTokensID = `${jurorAddress}-${subcourtID.toString()}`;
  let jurorTokens = JurorTokensPerSubcourt.load(jurorTokensID);
  let previousStake: BigInt;
  if (!jurorTokens) {
    jurorTokens = new JurorTokensPerSubcourt(jurorTokensID);
    jurorTokens.juror = jurorAddress;
    jurorTokens.subcourt = subcourtID.toString();
    jurorTokens.staked = ZERO;
    jurorTokens.locked = ZERO;
    jurorTokens.save();
    previousStake = ZERO;
  } else previousStake = jurorTokens.staked;
  updateJurorStake(
    jurorAddress,
    subcourtID.toString(),
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
    const subcourt = Court.load(dispute.subcourtID.toString());
    if (subcourt) {
      updateJurorStake(
        jurorAddress,
        subcourt.id,
        KlerosCore.bind(event.address),
        event.block.timestamp
      );
      subcourt.paidETH = subcourt.paidETH.plus(ethAmount);
      subcourt.paidPNK = subcourt.paidETH.plus(tokenAmount);
      subcourt.save();
    }
  }
}
