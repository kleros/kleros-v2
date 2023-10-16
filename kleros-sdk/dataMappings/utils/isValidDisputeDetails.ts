import { DisputeDetails, QuestionType } from "./disputeDetailsTypes";
import { isHexAddress } from "./isHexAddress";

export const isValidDisputeDetails = (data: any): data is DisputeDetails => {
  return (
    typeof data.title === "string" &&
    typeof data.description === "string" &&
    typeof data.question === "string" &&
    Object.values(QuestionType).includes(data.type) &&
    // TODO: Uncomment when you figure out how to fetch answers from reality
    // Array.isArray(data.answers) &&
    // data.answers.every(
    //   (answer) =>
    //     typeof answer.title === "string" &&
    //     typeof answer.description === "string" &&
    //     isHexAddress(answer.id) &&
    //     typeof answer.reserved === "boolean"
    // ) &&
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
