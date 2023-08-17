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
];

const initialState = {
  evidence: {
    fileURI: {
      photo: "https://photo.url",
      video: "https://video.url",
    },
  },
};

const fetchAction = async (variableName: string, link: string) => {
  const response = await fetch(link);
  const data = await response.json();
  return { [variableName]: data };
};

const graphqlAction = async (variableName: string, query: string) => {
  const response = await fetch("http://graphql-server-endpoint.com", {
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

const jsonAction = (currentAcc, source, seek, populate) => {
  const dataFromSource = currentAcc[source];
  let jsonData = {};

  seek.forEach((key, idx) => {
    jsonData[populate[idx]] = dataFromSource[key];
  });

  return jsonData;
};

const accumulatedData = mappings.reduce(async (acc, { type, source, inputs, seek, populate }) => {
  const currentAcc = await acc;

  switch (type) {
    case "fetch":
      return {
        ...currentAcc,
        ...(await fetchAction(inputs.variableName, inputs.link)),
      };

    case "graphql":
      return {
        ...currentAcc,
        ...(await graphqlAction(inputs.variableName, inputs.query)),
      };

    case "json":
      return {
        ...currentAcc,
        ...jsonAction(currentAcc, source, seek, populate),
      };

    default:
      return currentAcc;
  }
}, Promise.resolve(initialState));

console.log(accumulatedData);
