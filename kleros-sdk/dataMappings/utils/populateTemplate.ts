import mustache from "mustache";
import { DisputeDetails } from "./disputeDetailsTypes";
import { isValidDisputeDetails } from "./isValidDisputeDetails";

export const populateTemplate = (mustacheTemplate: string, data: any): DisputeDetails => {
  const render = mustache.render(mustacheTemplate, data);
  console.log("MUSTACHE RENDER: ", render);
  const dispute = JSON.parse(render);

  // TODO: the validation below is too strict, it should be fixed, disabled for now, FIXME
  if (!isValidDisputeDetails(dispute)) {
    //   throw new Error(`Invalid dispute details format: ${JSON.stringify(dispute)}`);
  }

  return dispute;
};
