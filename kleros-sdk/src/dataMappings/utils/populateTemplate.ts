import mustache from "mustache";
import { DisputeDetails } from "./disputeDetailsTypes";
import DisputeDetailsSchema, { RefuseToArbitrateAnswer } from "./disputeDetailsSchema";
import { lambdas } from "./lambdas";

export const populateTemplate = (mustacheTemplate: string, data: any): DisputeDetails => {
  const render = mustache.render(mustacheTemplate, { ...lambdas, ...data });
  const dispute = JSON.parse(render);

  const validation = DisputeDetailsSchema.safeParse(dispute);
  if (!validation.success) {
    throw validation.error;
  }

  return findAndUpdateRTA(dispute);
};

// Filter out any existing answer with id 0 and add customised Refuse to Arbitrate option
const findAndUpdateRTA = (dispute: DisputeDetails) => {
  const templateRTAIndex = (dispute as DisputeDetails).answers.findIndex(
    (answer) => answer.id && BigInt(answer.id) === BigInt(0)
  );

  if (templateRTAIndex !== -1) {
    dispute.answers[templateRTAIndex] = {
      ...RefuseToArbitrateAnswer,
      description: dispute.answers[templateRTAIndex].description ?? RefuseToArbitrateAnswer.description,
    };
  } else {
    dispute.answers = [RefuseToArbitrateAnswer, ...dispute.answers];
  }

  return dispute;
};
