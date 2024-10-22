import { MAX_BYTE_SIZE } from "../../consts";
import { RequestError } from "../../errors";
import { FetchIpfsJsonMapping } from "../utils/actionTypes";
import { createResultObject } from "../utils/createResultObject";

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
    throw new RequestError("Invalid IPFS URI format", httpUri);
  }

  const response = await fetch(httpUri, { method: "GET" });

  if (!response.ok) {
    throw new RequestError("Failed to fetch data from IPFS", httpUri);
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BYTE_SIZE) {
    throw new RequestError("Response size is too large", httpUri);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new RequestError("Fetched data is not JSON", httpUri);
  }

  const data = await response.json();

  return createResultObject(data, seek, populate);
};
