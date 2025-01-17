import mustache from "mustache";
import { DisputeDetails } from "./disputeDetailsTypes";
import DisputeDetailsSchema, { RefuseToArbitrateAnswer } from "./disputeDetailsSchema";

export const populateTemplate = (mustacheTemplate: string, data: any): DisputeDetails => {
  const render = mustache.render(mustacheTemplate, data);
  const dispute = JSON.parse(render);

  const validation = DisputeDetailsSchema.safeParse(dispute);
  if (!validation.success) {
    throw validation.error;
  }

  // Filter out any existing answer with id 0 and add our standard Refuse to Arbitrate option
  (dispute as DisputeDetails).answers = [
    RefuseToArbitrateAnswer,
    ...((dispute as DisputeDetails).answers.filter((answer) => answer.id && BigInt(answer.id) !== BigInt(0)) || []),
  ];

  return dispute;
};
