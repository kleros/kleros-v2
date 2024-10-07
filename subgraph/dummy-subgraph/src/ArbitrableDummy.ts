import {
  DisputeRequest,
  DisputeTemplate as DisputeTemplateEvent,
} from "../generated/templates/Arbitrable/ArbitrableDummy";
import { Dispute, DisputeTemplate } from "../generated/schema";

export function handleDisputeTemplate(event: DisputeTemplateEvent): void {
  const arbitrableAddress = event.address;
  const templateId = event.params._templateId;
  const disputeTemplate = new DisputeTemplate(`${arbitrableAddress.toHexString()}-${templateId}`);
  disputeTemplate.arbitrable = arbitrableAddress;
  disputeTemplate.templateData = event.params._templateData;
  disputeTemplate.templateDataMappings = event.params._templateDataMappings;
  disputeTemplate.save();
}

export function handleDisputeRequest(event: DisputeRequest): void {
  const arbitrableAddress = event.address;
  const disputeID = event.params._arbitrableDisputeID;
  const templateId = event.params._templateId;
  const dispute = new Dispute(`${arbitrableAddress.toHexString()}-${disputeID}`);
  dispute.arbitrable = arbitrableAddress;
  dispute.disputeID = disputeID;
  dispute.externalDisputeID = event.params._externalDisputeID;
  dispute.templateId = templateId;
  dispute.template = `${arbitrableAddress.toHexString()}-${templateId}`;
  dispute.save();
}
