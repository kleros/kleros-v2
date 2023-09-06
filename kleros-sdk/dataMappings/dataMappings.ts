import { createPublicClient, http, parseAbiItem } from "viem";
import { arbitrumGoerli } from "viem/chains";
import fetch from "node-fetch";

const publicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(),
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

// Utility function to access nested objects
const getNestedObject = (nestedObj, pathArr) => {
  return pathArr.reduce((obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : undefined), nestedObj);
};

export const jsonAction = (currentAcc, source, seek, populate) => {
  const pathArray = typeof source === "string" ? source.split(".") : source;

  const dataFromSource = getNestedObject(currentAcc, pathArray);
  let jsonData = {};

  seek.forEach((key, idx) => {
    jsonData[populate[idx]] = dataFromSource[key];
  });

  return jsonData;
};

export const fetchAction = async (variableName: string, link: string) => {
  const response = await fetch(link);
  const data = await response.json();
  return { [variableName]: data };
};

export const graphqlAction = async (variableName: string, query: string) => {
  const response = await fetch("https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();
  return { [variableName]: data };
};

// export const callAction = async (abi, inputs, seek, populate) => {
//   const data = await publicClient.readContract({
//     address: inputs[0],
//     abi: abi,
//     functionName: seek,
//     args: inputs,
//   });

//   let populatedData = {};

//   seek.map((item, index) => {
//     populatedData[populate[index]] = data[item];
//   });

//   return populatedData;
// };

// export const eventAction = async (source, inputs, seek, populate) => {
//   const filter = await publicClient.createEventFilter({
//     address: inputs[1],
//     event: parseAbiItem(source) as any,
//     args: inputs,
//   });

//   const contractEvent = await publicClient.getFilterLogs({
//     filter: filter as any,
//   });

//   const eventData = contractEvent[0].args;

//   let populatedData = {};

//   seek.map((item, index) => {
//     populatedData[populate[index]] = eventData[item];
//   });

//   return populatedData;
// };

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
