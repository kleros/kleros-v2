import { createPublicClient, http, parseAbiItem, webSocket } from "viem";
import { arbitrumGoerli } from "viem/chains";
import fetch from "node-fetch";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const transport = webSocket(`wss://arb-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);

const publicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport,
});

export const mappings = [
  {
    type: "fetch",
    source: "someAPIEndpoint",
    inputs: {
      variableName: "disputeData",
      link: "https://someapi.com/disputeData",
    },
    seek: [],
    populate: [],
  },
  {
    type: "graphql",
    source: "someGraphqlEndpoint",
    inputs: {
      variableName: "submissionData",
      query: "someGraphqlQuery",
    },
    seek: [],
    populate: [],
  },
  {
    type: "json",
    source: "evidence",
    inputs: {},
    seek: ["fileURI"],
    populate: ["fileURI"],
  },
  {
    type: "json",
    source: "fileURI",
    inputs: {},
    seek: ["photo", "video"],
    populate: ["photoUrl", "videoUrl"],
  },
  {
    type: "abi/call",
    source: "contractCall",
    inputs: [],
    seek: [],
    populate: [],
  },
  {
    type: "abi/event",
    source: "contractEvent",
    inputs: [],
    seek: [],
    populate: [],
  },
];

const initialState = {
  evidence: {
    fileURI: {
      photo: "https://photo.url",
      video: "https://video.url",
    },
  },
};

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

export const jsonAction = (data, seek, populate) => {
  let jsonData = {};

  seek.forEach((key, idx) => {
    const foundValue = findNestedKey(data, key);
    jsonData[populate[idx]] = foundValue;
  });

  return jsonData;
};

export const fetchAction = async (link: string, seek, populate) => {
  const response = await fetch(link);
  const fetchedData = await response.json();
  console.log(fetchedData);
  let populatedData = {};

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

export const callAction = async (abi, inputs, seek, populate) => {
  const data = await publicClient.readContract({
    address: inputs[0],
    abi: [abi],
    functionName: seek[0],
    args: [inputs[1]],
  });
  console.log("callaction");

  console.log("data", data);

  let populatedData = {};

  seek.map((item, index) => {
    populatedData[populate[index]] = data;
  });

  return populatedData;
};

export const eventAction = async (source, inputs, seek, populate) => {
  console.log("entry", inputs[0]);

  const filter = await publicClient.createEventFilter({
    address: inputs[0],
    event: source,
    fromBlock: inputs[1],
    toBlock: "latest",
  });

  const contractEvent = await publicClient.getFilterLogs({
    filter: filter as any,
  });

  // @ts-ignore
  const eventData = contractEvent[0].args;
  // console.log("🚀 ~ file: dataMappings.ts:145 ~ eventAction ~ eventData:", eventData);

  let populatedData = {};

  seek.map((item, index) => {
    // console.log("item", item);

    populatedData[populate[index]] = eventData[item];
  });

  return populatedData;
};

// const accumulatedData = mappings.reduce(async (acc, { type, source, inputs, seek, populate }) => {
//   const currentAcc = await acc;

//   switch (type) {
//     case "fetch":
//       return {
//         ...currentAcc,
//         ...(await fetchAction(inputs.variableName, inputs.link)),
//       };

//     case "graphql":
//       return {
//         ...currentAcc,
//         ...(await graphqlAction(inputs.variableName, inputs.query)),
//       };

//     case "json":
//       return {
//         ...currentAcc,
//         ...jsonAction(currentAcc, source, seek, populate),
//       };
//     case "abi/call":
//       return {
//         ...currentAcc,
//         ...(await callAction(source, inputs, seek, populate)),
//       };
//     // case "abi/event":
//     //   return {
//     //     ...currentAcc,
//     //     ...(await eventAction(source, inputs, seek, populate)),
//     //   };

//     default:
//       return currentAcc;
//   }
// }, Promise.resolve(initialState));

// console.log(accumulatedData);
