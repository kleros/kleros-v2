import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { ArchivedDispute, ArchivedDisputeAmended } from "../generated/DisputeArchive/DisputeArchive";
import { Dispute } from "../generated/schema";
import { createArchiveOnlyDispute } from "./archive/disputeArchiveStubs";
import { ONE } from "./utils";

function createArchiveDispute(
  disputeId: BigInt,
  courtId: BigInt,
  cid: string,
  reason: string | null,
  timestamp: BigInt,
  blockNumber: BigInt,
  transactionHash: Bytes
): void {
  const dispute = Dispute.load(disputeId.toString());

  // if dispute is present, then it is an amend event
  if (dispute) {
    dispute.isArchived = true;
    dispute.archiveCid = cid;
    dispute.save();
    return;
  }

  createArchiveOnlyDispute(disputeId, courtId, cid, reason, timestamp, blockNumber, transactionHash);
}

export function handleDisputeArchived(event: ArchivedDispute): void {
  createArchiveDispute(
    event.params.id,
    event.params.courtId,
    event.params.cid,
    null,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );
}

export function handleDisputeAmended(event: ArchivedDisputeAmended): void {
  createArchiveDispute(
    event.params.id,
    ONE, // this is placeholder, will not be used
    event.params.cid,
    event.params.reason,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );
}
