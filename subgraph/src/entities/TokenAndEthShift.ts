import { TokenAndETHShift as TokenAndETHShiftEvent } from "../../generated/KlerosCore/KlerosCore";
import { TokenAndETHShift } from "../../generated/schema";

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
