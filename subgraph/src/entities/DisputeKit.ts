import { Bytes } from "@graphprotocol/graph-ts";
import { DisputeKitCreated } from "../../generated/KlerosCore/KlerosCore";
import { DisputeKit } from "../../generated/schema";
import { ZERO, ONE } from "../utils";

export function ensureDisputeKit(id: string): DisputeKit {
  let disputeKit = DisputeKit.load(id);

  if (disputeKit) {
    return disputeKit;
  }
  // Should never reach here
  disputeKit = new DisputeKit(id);
  disputeKit.parent = "0";
  disputeKit.address = Bytes.fromHexString("0x0");
  disputeKit.needsFreezing = false;
  const parent = ensureDisputeKit("0");
  disputeKit.depthLevel = id === "0" ? ZERO : parent.depthLevel.plus(ONE);
  disputeKit.save();

  return disputeKit;
}

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
