import {
  HomeGateway,
  Dispute as DisputeEvent,
} from "../generated/HomeGateway/HomeGateway";
import {
  GatewayDispute
} from "../generated/schema";

export function handleDisputeEvent(event: DisputeEvent): void {
  const contract = HomeGateway.bind(event.address);
  const disputeID = event.params._disputeID;
  const dispute = new GatewayDispute(disputeID.toString());
  dispute.homeDispute = disputeID.toString();
  dispute.arbitrator = contract.arbitrator();
  const disputeHash = contract.disputeIDtoHash(disputeID);
  dispute.disputeHash = disputeHash;
  const relayedData = contract.disputeHashtoRelayedData(disputeHash);
  dispute.arbitrationCost = relayedData.value0;
  dispute.relayer = relayedData.value1;
  dispute.save();
}
