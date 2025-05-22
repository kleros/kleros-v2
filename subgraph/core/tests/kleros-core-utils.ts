import { newMockEvent } from "matchstick-as";
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts";
import { AppealDecision } from "../generated/KlerosCore/KlerosCore";

export function createAppealDecisionEvent(
  disputeID: BigInt,
  arbitrable: Address,
  blockNumber: BigInt,
  timestamp: BigInt,
  logIndex: BigInt,
  transactionHash: string = "0x0000000000000000000000000000000000000000000000000000000000000000" // Default transaction hash
): AppealDecision {
  let appealDecisionEvent = changetype<AppealDecision>(newMockEvent());

  appealDecisionEvent.parameters = new Array();
  appealDecisionEvent.block.number = blockNumber;
  appealDecisionEvent.block.timestamp = timestamp;
  appealDecisionEvent.logIndex = logIndex;
  appealDecisionEvent.transaction.hash = Address.fromString(transactionHash);


  appealDecisionEvent.parameters.push(
    new ethereum.EventParam("_disputeID", ethereum.Value.fromUnsignedBigInt(disputeID))
  );
  appealDecisionEvent.parameters.push(
    new ethereum.EventParam("_arbitrable", ethereum.Value.fromAddress(arbitrable))
  );

  return appealDecisionEvent;
}
