import { InvalidContextError, NotFoundError } from "../errors";
import { executeAction } from "./executeActions";
import { AbiEventMapping } from "./utils/actionTypes";

export type RealityAnswer = {
  title: string;
  description: string;
  id: string;
  reserved: boolean;
  last?: boolean;
};

export const retrieveRealityData = async (realityQuestionID: string, arbitrable?: `0x${string}`) => {
  if (!arbitrable) {
    throw new InvalidContextError("No arbitrable address provided");
  }
  const questionMapping: AbiEventMapping = {
    type: "abi/event",
    abi: "event LogNewQuestion(bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 created)",
    address: arbitrable,
    eventFilter: {
      args: [realityQuestionID],
      fromBlock: "earliest",
      toBlock: "latest",
    },
    seek: [
      "question_id",
      "user",
      "template_id",
      "question",
      "content_hash",
      "arbitrator",
      "timeout",
      "opening_ts",
      "nonce",
      "created",
    ],
    populate: [
      "realityQuestionID",
      "realityUser",
      "realityTemplateID",
      "realityQuestion",
      "contentHash",
      "arbitrator",
      "timeout",
      "openingTs",
      "nonce",
      "created",
    ],
  };

  const questionData = await executeAction(questionMapping);
  console.log("questionData", questionData);

  const templateMapping: AbiEventMapping = {
    type: "abi/event",
    abi: "event LogNewTemplate(uint256 indexed template_id, address indexed user, string question_text)",
    address: arbitrable,
    eventFilter: {
      args: [0],
      fromBlock: "earliest",
      toBlock: "latest",
    },
    seek: ["template_id", "question_text"],
    populate: ["templateID", "questionText"],
  };

  const templateData = await executeAction(templateMapping);
  console.log("templateData", templateData);

  if (!templateData) {
    throw new NotFoundError("Template Data", "Failed to retrieve template data");
  }

  if (!questionData) {
    throw new NotFoundError("Question Data", "Failed to retrieve question data");
  }

  const rc_question = require("@reality.eth/reality-eth-lib/formatters/question.js");
  const populatedTemplate = rc_question.populatedJSONForTemplate(
    templateData.questionText,
    questionData.realityQuestion
  );

  console.log("populatedTemplate", populatedTemplate);

  let answers: RealityAnswer[] = [];
  if (populatedTemplate.type === "bool") {
    answers = [
      {
        title: "Yes",
        description: "",
        id: "0x01",
        reserved: false,
      },
      {
        title: "No",
        description: "",
        id: "0x02",
        reserved: false,
      },
    ];
  }

  answers.push({
    id: "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
    title: "Answered Too Soon",
    description: "",
    reserved: true,
  });

  for (let i = 0; i < answers.length; i++) {
    answers[i].last = i === answers.length - 1;
  }

  return {
    question: questionData.realityQuestion,
    type: populatedTemplate.type,
    realityAddress: questionData.arbitrator,
    questionId: questionData.realityQuestionID,
    realityUser: questionData.realityUser,
    answers,
  };
};
