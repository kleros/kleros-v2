import mustache from "mustache";
import { DisputeDetails } from "./disputeDetailsTypes";
import DisputeDetailsSchema from "./disputeDetailsSchema";

export const populateTemplate = (mustacheTemplate: string, data: any): DisputeDetails => {
  const render = mustache.render(mustacheTemplate, data);
  const dispute = JSON.parse(render);

  const validation = DisputeDetailsSchema.safeParse(dispute);
  if (!validation.success) {
    throw validation.error;
  }

  return dispute;
};
