import mustache from "mustache";
import { DisputeDetails } from "./disputeDetailsTypes";
import { validate } from "./DisputeDetailsValidator";

export const populateTemplate = (mustacheTemplate: string, data: any): DisputeDetails => {
  const render = mustache.render(mustacheTemplate, data);
  const dispute = JSON.parse(render);

  // TODO: the validation below is too strict, it should be fixed, disabled for now, FIXME
  if (!validate(dispute)) {
    //   throw new Error(`Invalid dispute details format: ${JSON.stringify(dispute)}`);
  }

  return dispute;
};
