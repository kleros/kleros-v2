import { DisputeKitCreated } from "../../generated/KlerosCore/KlerosCore";
import { DisputeKit } from "../../generated/schema";
import { ZERO, ONE } from "../utils";

export function createDisputeKitFromEvent(event: DisputeKitCreated): void {
  const disputeKit = new DisputeKit(event.params._disputeKitID.toString());
  disputeKit.parent = event.params._parent.toString();
  disputeKit.address = event.params._disputeKitAddress;
  disputeKit.needsFreezing = false;
  const parent = DisputeKit.load(event.params._parent.toString());
  disputeKit.depthLevel = parent ? parent.depthLevel.plus(ONE) : ZERO;
  disputeKit.save();
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
