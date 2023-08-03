import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TokenAndETHShift as TokenAndETHShiftEvent } from "../../generated/KlerosCore/KlerosCore";
import { Court, Dispute, TokenAndETHShift } from "../../generated/schema";
import { updatePaidETH, updateRedistributedPNK } from "../datapoint";
import { ZERO } from "../utils";
import { convertTokenAmountToEth, updateFeeTokenPaid } from "./FeeToken";
import { resolveUserDispute } from "./User";

export function updateTokenAndEthShiftFromEvent(event: TokenAndETHShiftEvent): void {
  const jurorAddress = event.params._account;
  const disputeID = event.params._disputeID;
  const dispute = Dispute.load(disputeID.toString());
  if (!dispute) return;
  const court = Court.load(dispute.court);
  if (!court) return;
  const roundIndex = event.params._roundID;
  const feeTokenAddress = event.params._feeToken;
  let shift = ensureTokenAndEthShift(jurorAddress, disputeID, roundIndex, feeTokenAddress);
  const feeAmount = event.params._feeAmount;
  const pnkAmount = event.params._pnkAmount;
  let ethAmount: BigInt;
  if (feeTokenAddress.toHexString() === "0x0000000000000000000000000000000000000000") {
    updateFeeTokenPaid(feeTokenAddress, event.address, feeAmount);
    ethAmount = convertTokenAmountToEth(feeTokenAddress, feeAmount, event.address);
    shift.feeTokenAmount = shift.feeTokenAmount.plus(feeAmount);
  } else {
    ethAmount = feeAmount;
  }
  const previousEthAmount = shift.ethAmount;
  const newEthAmount = previousEthAmount.plus(ethAmount);
  shift.ethAmount = newEthAmount;
  resolveUserDispute(jurorAddress.toHexString(), previousEthAmount, newEthAmount, disputeID.toString());
  court.paidETH = court.paidETH.plus(ethAmount);
  updatePaidETH(ethAmount, event.block.timestamp);
  if (pnkAmount.gt(ZERO)) {
    court.paidPNK = court.paidPNK.plus(pnkAmount);
    updateRedistributedPNK(pnkAmount, event.block.timestamp);
  }
  shift.pnkAmount = shift.pnkAmount.plus(pnkAmount);
  shift.save();
  court.save();
}

export function ensureTokenAndEthShift(
  jurorAddress: Address,
  disputeID: BigInt,
  roundIndex: BigInt,
  feeTokenAddress: Address
): TokenAndETHShift {
  const shiftID = `${jurorAddress.toHexString()}-${disputeID.toString()}-${roundIndex.toString()}`;
  let shift = TokenAndETHShift.load(shiftID);
  if (!shift) {
    shift = new TokenAndETHShift(shiftID);
    if (feeTokenAddress !== Address.fromI32(0)) {
      shift.isNativeCurrency = false;
      shift.feeToken = feeTokenAddress.toHexString();
    } else {
      shift.isNativeCurrency = true;
    }
    shift.feeTokenAmount = ZERO;
    shift.ethAmount = ZERO;
    shift.juror = jurorAddress.toHexString();
    shift.dispute = disputeID.toString();
    shift.pnkAmount = ZERO;
    shift.save();
  }
  return shift;
}
