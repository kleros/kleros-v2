import mustache from "mustache";
import { DisputeDetails } from "./disputeDetailsTypes";
import DisputeDetailsSchema from "./disputeDetailsSchema";

export const populateTemplate = (mustacheTemplate: string, data: any): DisputeDetails => {
  const render = mustache.render(mustacheTemplate, data);
  const dispute = JSON.parse(render);

  const validation = DisputeDetailsSchema.safeParse(dispute);
  if (!validation.success) {
    console.error("Validation errors:", validation.error.errors, "\n\nDispute details:", `${JSON.stringify(dispute)}`);
    throw new Error("Invalid dispute details format");
  }
  console.log(dispute);

  return dispute;
};
