import { DisputeTemplate as DisputeTemplateEvent } from "../generated/DisputeTemplateRegistry/DisputeTemplateRegistry";
import { DisputeTemplate } from "../generated/schema";

export function handleDisputeTemplate(event: DisputeTemplateEvent): void {
  const disputeTemplateId = event.params._templateId.toString();
  const disputeTemplate = new DisputeTemplate(disputeTemplateId);
  disputeTemplate.templateTag = event.params._templateTag.toHexString();
  disputeTemplate.templateData = event.params._templateData.toString();
  disputeTemplate.templateDataMappings = event.params._templateDataMappings.toString();
  disputeTemplate.save();
}
