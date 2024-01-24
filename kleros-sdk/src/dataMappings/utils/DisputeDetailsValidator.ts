import { DisputeDetails, QuestionType } from "./disputeDetailsTypes";

const isHexAddress = (str: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(str);

const isHexId = (str: string): boolean => /^0x[a-fA-F0-9]{1,64}$/.test(str);

export const validate = (data: any): data is DisputeDetails => {
  return (
    typeof data.title === "string" &&
    typeof data.description === "string" &&
    typeof data.question === "string" &&
    Object.values(QuestionType).includes(data.type) &&
    Array.isArray(data.answers) &&
    data.answers.every(
      (answer) =>
        typeof answer.title === "string" &&
        typeof answer.description === "string" &&
        isHexId(answer.id) &&
        typeof answer.reserved === "boolean"
    ) &&
    typeof data.policyURI === "string" &&
    typeof data.frontendUrl === "string" &&
    typeof data.arbitrableChainID === "string" &&
    isHexAddress(data.arbitrableAddress) &&
    typeof data.arbitratorChainID === "string" &&
    isHexAddress(data.arbitratorAddress) &&
    typeof data.category === "string" &&
    typeof data.lang === "string" &&
    typeof data.specification === "string" &&
    typeof data.version === "string"
  );
};
