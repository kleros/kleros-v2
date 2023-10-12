import { createPublicClient, parseAbiItem, webSocket } from "viem";
import { arbitrumGoerli } from "viem/chains";
import fetch from "node-fetch";
import mustache from "mustache";
import { DisputeDetails } from "./disputeDetails";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const transport = webSocket(`wss://arb-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);

const publicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport,
});

const findNestedKey = (data, keyToFind) => {
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

export const fetchAction = async (link: string, seek, populate) => {
  const response = await fetch(link);
  const fetchedData = await response.json();
  console.log(fetchedData);
  const populatedData = {};

  seek.forEach((key, idx) => {
    const foundValue = findNestedKey(fetchedData, key);
    populatedData[populate[idx]] = foundValue;
  });

  return populatedData;
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

  seek.map((item) => {
    if (typeof data == "object") {
      populatedData[populate[item]] = data[item];
    } else {
      populatedData[populate[item]] = data;
    }
  });

  return populatedData;
};

export const eventAction = async (source, inputs, seek, populate) => {
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
    case "fetch":
      return await fetchAction(action.source, action.seek, action.populate);
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

export const parseTemplateWithData = (template, data) => {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => data[key.trim()] || "");
};

export const populateTemplate = (mustacheTemplate: string, data: any): DisputeDetails => {
  const render = mustache.render(mustacheTemplate, data);
  console.log("MUSTACHE RENDER: ", render);
  const dispute = JSON.parse(render);
  // TODO: validate the object according to the DisputeDetails type or a JSON schema
  return dispute;
};
