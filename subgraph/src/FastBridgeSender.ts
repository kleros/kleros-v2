import { BatchOutgoing as BatchOutgoingEvent } from "../generated/FastBridgeSender/FastBridgeSender";
import { OutgoingBatch } from "../generated/schema";

export function handleBatchOutgoing(event: BatchOutgoingEvent): void {
  const outgoingBatch = new OutgoingBatch(event.params.batchID.toHexString());
  outgoingBatch.size = event.params.batchSize;
  outgoingBatch.epoch = event.params.epoch;
  outgoingBatch.batchMerkleRoot = event.params.batchMerkleRoot.toHex();
  outgoingBatch.save();
}
