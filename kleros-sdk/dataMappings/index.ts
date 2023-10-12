import { createPublicClient, parseAbiItem, webSocket } from "viem";
import { arbitrumGoerli } from "viem/chains";
import fetch from "node-fetch";
import mustache from "mustache";
import { DisputeDetails } from "./disputeDetails";
import dotenv from "dotenv";

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

export const findNestedKey = (data, keyToFind) => {
  if (data.hasOwnProperty(keyToFind)) return data[keyToFind];
  for (let key in data) {
    if (typeof data[key] === "object" && data[key] !== null) {
      const found = findNestedKey(data[key], keyToFind);
      if (found) return found;
    }
  }
  return null;
};

export const jsonAction = (source, seek, populate) => {
  let jsonData = {};

  seek.forEach((key, idx) => {
    const foundValue = findNestedKey(source, key);
    jsonData[populate[idx]] = foundValue;
  });

  return jsonData;
};

export const graphqlAction = async (query: string, seek, populate) => {
  const response = await fetch("https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();
  console.log(data);
  let populatedData = {};

  seek.forEach((key, idx) => {
    const foundValue = findNestedKey(data, key);
    populatedData[populate[idx]] = foundValue;
  });

  return populatedData;
};

export const callAction = async (source, inputs, seek, populate) => {
  if (!publicClient) {
    throw new Error("SDK not configured. Please call `configureSDK` before using.");
  }

  let parsedAbi;

  if (typeof source === "string") {
    parsedAbi = parseAbiItem(source);
  } else {
    parsedAbi = source;
  }

  const data = await publicClient.readContract({
    address: inputs[0],
    abi: [parsedAbi],
    functionName: inputs[1],
    args: inputs.slice(2),
  });

  const populatedData = {};

  seek.map((item, index) => {
    if (typeof data == "object") {
      populatedData[populate[index]] = data[item];
    } else {
      populatedData[populate[index]] = data;
    }
  });

  return populatedData;
};

export const eventAction = async (source, inputs, seek, populate) => {
  if (!publicClient) {
    throw new Error("SDK not configured. Please call `configureSDK` before using.");
  }

  let parsedAbi;

  if (typeof source === "string") {
    parsedAbi = parseAbiItem(source);
  } else {
    parsedAbi = source;
  }

  const argsObject = seek.reduce((acc, key, index) => {
    acc[key] = inputs[index + 2];
    return acc;
  }, {});

  const filter = await publicClient.createEventFilter({
    address: inputs[0],
    event: parsedAbi,
    args: { ...argsObject },
    fromBlock: inputs[1],
    toBlock: "latest",
  });

  const contractEvent = await publicClient.getFilterLogs({
    filter: filter as any,
  });

  const eventData = contractEvent[0].args;

  const populatedData = {};

  seek.map((item, index) => {
    populatedData[populate[index]] = eventData[item];
  });

  return populatedData;
};

export const executeAction = async (action) => {
  switch (action.type) {
    case "graphql":
      return await graphqlAction(action.source, action.seek, action.populate);
    case "json":
      return jsonAction(action.source, action.seek, action.populate);
    case "abi/call":
      return await callAction(action.source, action.inputs, action.seek, action.populate);
    case "abi/event":
      return await eventAction(action.source, action.inputs, action.seek, action.populate);
    default:
      throw new Error(`Unsupported action type: ${action.type}`);
  }
};

export const populateTemplate = (mustacheTemplate: string, data: any): DisputeDetails => {
  const render = mustache.render(mustacheTemplate, data);
  console.log("MUSTACHE RENDER: ", render);
  const dispute = JSON.parse(render);
  return dispute;
};
