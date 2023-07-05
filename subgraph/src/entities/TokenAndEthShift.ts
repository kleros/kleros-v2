import { TokenAndETHShift as TokenAndETHShiftEvent } from "../../generated/KlerosCore/KlerosCore";
import { TokenAndETHShift } from "../../generated/schema";
import { ZERO } from "../utils";
import { resolveUserDispute } from "./User";

export function updateTokenAndEthShiftFromEvent(event: TokenAndETHShiftEvent): void {
  const jurorAddress = event.params._account.toHexString();
  const disputeID = event.params._disputeID.toString();
  const shiftID = `${jurorAddress}-${disputeID}`;
  const shift = TokenAndETHShift.load(shiftID);

  if (!shift) {
    createTokenAndEthShiftFromEvent(event);
    resolveUserDispute(jurorAddress, ZERO, event.params._feeAmount, disputeID);
    return;
  }

  shift.tokenAmount = shift.tokenAmount.plus(event.params._pnkAmount);
  const previousFeeAmount = shift.ethAmount;
  const newFeeAmount = shift.ethAmount.plus(event.params._feeAmount);
  shift.ethAmount = newFeeAmount;
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
  shift.tokenAmount = event.params._pnkAmount;
  shift.ethAmount = event.params._feeAmount;
  shift.save();
}
