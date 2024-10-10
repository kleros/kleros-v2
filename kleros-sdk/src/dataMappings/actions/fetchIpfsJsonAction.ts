import { FetchIpfsJsonMapping } from "src/dataMappings/utils/actionTypes";
import { createResultObject } from "src/dataMappings/utils/createResultObject";
import { MAX_BYTE_SIZE } from "src/consts";

export const fetchIpfsJsonAction = async (mapping: FetchIpfsJsonMapping) => {
  const { ipfsUri, seek, populate } = mapping;

  let httpUri;
  if (ipfsUri.startsWith("/ipfs/")) {
    httpUri = `https://ipfs.io${ipfsUri}`;
  } else if (ipfsUri.startsWith("ipfs://")) {
    httpUri = ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  } else if (!ipfsUri.startsWith("http")) {
    httpUri = `https://ipfs.io/ipfs/${ipfsUri}`;
  } else {
    throw new Error("Invalid IPFS URI format");
  }

  const response = await fetch(httpUri, { method: "GET" });

  if (!response) {
    throw new Error("Failed to fetch data from IPFS");
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BYTE_SIZE) {
    throw new Error("Response size is too large");
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Fetched data is not JSON");
  }

  const data = await response.json();

  return createResultObject(data, seek, populate);
};
