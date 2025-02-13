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

  const templateRTAAnswer = (dispute as DisputeDetails).answers.find(
    (answer) => answer.id && BigInt(answer.id) === BigInt(0)
  );

  const CustomRTA: DisputeDetails["answers"][number] = {
    ...RefuseToArbitrateAnswer,
    description: templateRTAAnswer?.description ?? RefuseToArbitrateAnswer.description,
  };

  // Filter out any existing answer with id 0 and add customised Refuse to Arbitrate option
  (dispute as DisputeDetails).answers = [
    CustomRTA,
    ...((dispute as DisputeDetails).answers.filter((answer) => answer.id && BigInt(answer.id) !== BigInt(0)) || []),
  ];

  return dispute;
};
