import { createPublicClient, parseAbiItem, webSocket } from "viem";
import { arbitrumGoerli } from "viem/chains";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { AbiCallMapping, AbiEventMapping, ActionMapping, JsonMapping, SubgraphMapping } from "./utils/actionTypes";
import { isAbiCallMapping, isAbiEventMapping, isJsonMapping, isSubgraphMapping } from "./utils/actionTypeDetectors";
import { findNestedKey } from "./utils/findNestedKey";

dotenv.config();

let ALCHEMY_API_KEY: string | undefined = process.env.ALCHEMY_API_KEY;
let transport;
let publicClient;

export const configureSDK = (config: { apiKey?: string }) => {
  if (config.apiKey) {
    ALCHEMY_API_KEY = config.apiKey;
    transport = webSocket(`wss://arb-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
    publicClient = createPublicClient({
      chain: arbitrumGoerli,
      transport,
    });
  }
};

export const jsonAction = (mapping: JsonMapping) => {
  const { value: source, seek, populate } = mapping;

  let jsonData = {};
  seek.forEach((key, idx) => {
    const foundValue = findNestedKey(source, key);
    jsonData[populate[idx]] = foundValue;
  });

  return jsonData;
};

export const subgraphAction = async (mapping: SubgraphMapping) => {
  const { endpoint, query, seek, populate } = mapping;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();

  let populatedData = {};
  seek.forEach((key, idx) => {
    const foundValue = findNestedKey(data, key);
    populatedData[populate[idx]] = foundValue;
  });

  return populatedData;
};

export const callAction = async (mapping: AbiCallMapping) => {
  const { abi: source, address, args, seek, populate } = mapping;

  if (!publicClient) {
    throw new Error("SDK not configured. Please call `configureSDK` before using.");
  }

  let parsedAbi = typeof source === "string" ? parseAbiItem(source) : source;

  const data = await publicClient.readContract({
    address: address,
    abi: [parsedAbi],
    args: args,
  });

  let populatedData = {};
  seek.map((item, index) => {
    populatedData[populate[index]] = data[item];
  });

  return populatedData;
};

export const eventAction = async (mapping: AbiEventMapping) => {
  const { abi: source, address, eventFilter, seek, populate } = mapping;

  if (!publicClient) {
    throw new Error("SDK not configured. Please call `configureSDK` before using.");
  }

  let parsedAbi = typeof source === "string" ? parseAbiItem(source) : source;

  const filter = await publicClient.createEventFilter({
    address: address,
    event: parsedAbi,
    args: eventFilter.args,
    fromBlock: eventFilter.fromBlock,
    toBlock: eventFilter.toBlock,
  });

  const contractEvent = await publicClient.getFilterLogs({ filter: filter as any });
  const eventData = contractEvent[0].args;

  let populatedData = {};
  seek.map((item, index) => {
    populatedData[populate[index]] = eventData[item];
  });

  return populatedData;
};

export const executeAction = async (mapping: ActionMapping) => {
  switch (mapping.type) {
    case "graphql":
      if (!isSubgraphMapping(mapping)) {
        throw new Error("Invalid mapping for graphql action.");
      }
      return await subgraphAction(mapping);
    case "json":
      if (!isJsonMapping(mapping)) {
        throw new Error("Invalid mapping for json action.");
      }
      return jsonAction(mapping);
    case "abi/call":
      if (!isAbiCallMapping(mapping)) {
        throw new Error("Invalid mapping for abi/call action.");
      }
      return await callAction(mapping);
    case "abi/event":
      if (!isAbiEventMapping(mapping)) {
        throw new Error("Invalid mapping for abi/event action.");
      }
      return await eventAction(mapping);
    default:
      throw new Error(`Unsupported action type: ${mapping.type}`);
  }
};

export const retrieveRealityData = async (realityQuestionID: string) => {
  const questionMapping: AbiEventMapping = {
    type: "abi/event",
    abi: "event LogNewQuestion(bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 created)",
    address: "0x14a6748192abc6e10ca694ae07bdd4327d6c7a51",
    eventFilter: {
      args: [realityQuestionID],
      fromBlock: "0x1",
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
    address: "0x14a6748192abc6e10ca694ae07bdd4327d6c7a51",
    eventFilter: {
      args: [0],
      fromBlock: "0x1",
      toBlock: "latest",
    },
    seek: ["template_id", "question_text"],
    populate: ["templateID", "questionText"],
  };

  const templateData = await executeAction(templateMapping);
  console.log("templateData", templateData);

  const rc_question = require("@reality.eth/reality-eth-lib/formatters/question.js");
  const populatedTemplate = rc_question.populatedJSONForTemplate(
    templateData.questionText,
    questionData.realityQuestion
  );

  console.log("populatedTemplate", populatedTemplate);

  let answers = [];
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
    answers: answers,
  };
};
