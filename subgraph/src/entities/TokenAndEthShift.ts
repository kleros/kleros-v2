import { TokenAndETHShift as TokenAndETHShiftEvent } from "../../generated/KlerosCore/KlerosCore";
import { FeeToken, TokenAndETHShift } from "../../generated/schema";
import { ZERO } from "../utils";
import { resolveUserDispute } from "./User";

export function updateTokenAndEthShiftFromEvent(event: TokenAndETHShiftEvent): void {
  const jurorAddress = event.params._account.toHexString();
  const disputeID = event.params._disputeID.toString();
  const shiftID = `${jurorAddress}-${disputeID}`;
  const shift = TokenAndETHShift.load(shiftID);
  const feeToken = FeeToken.load(event.params._feeToken.toHexString());
  if (!shift) {
    createTokenAndEthShiftFromEvent(event);
    resolveUserDispute(jurorAddress, ZERO, event.params._feeAmount, disputeID);
    return;
  }
  if (!feeToken) return;
  shift.feeToken = event.params._feeToken.toHexString();
  shift.feeTokenAmount = shift.feeTokenAmount.plus(feeToken.totalPaid);
  shift.pnkAmount = shift.pnkAmount.plus(event.params._pnkAmount);
  const previousFeeAmount = shift.ethAmount;
  const newFeeAmount = shift.ethAmount.plus(event.params._feeAmount);
  shift.ethAmount = newFeeAmount.plus(feeToken.totalPaidInETH);
  shift.save();
  resolveUserDispute(jurorAddress, previousFeeAmount, newFeeAmount, disputeID);
}

export function createTokenAndEthShiftFromEvent(event: TokenAndETHShiftEvent): void {
  const jurorAddress = event.params._account.toHexString();
  const disputeID = event.params._disputeID.toString();
  const shiftID = `${jurorAddress}-${disputeID}`;
  const shift = new TokenAndETHShift(shiftID);
  shift.juror = jurorAddress;
  shift.dispute = disputeID;
  shift.pnkAmount = event.params._pnkAmount;
  shift.ethAmount = event.params._feeAmount;
  shift.feeTokenAmount = ZERO;
  shift.feeToken = event.params._feeToken.toString();
  shift.save();
}
