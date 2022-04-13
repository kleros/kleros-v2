import {
  OutgoingMessage as OutgoingMessageEvent,
} from "../generated/FastBridgeSender/FastBridgeSender";
import {
  OutgoingMessage
} from "../generated/schema";

export function handleOutgoingMessage(event: OutgoingMessageEvent): void {
  const outgoingMessage = new OutgoingMessage(
    event.params.messageHash.toHexString()
  );
  outgoingMessage.target = event.params.target;
  outgoingMessage.messageHash = event.params.messageHash.toHex();
  outgoingMessage.message = event.params.message.toHex();
  outgoingMessage.save();
}
