export type JsonMapping = {
  type: string;
  value: object;
  seek: string[];
  populate: string[];
};

export type SubgraphMapping = {
  type: string;
  endpoint: string;
  query: string;
  variables?: string[];
  seek: string[];
  populate: string[];
};

export type AbiCallMapping = {
  type: string;
  abi: string;
  address: string;
  args: any[];
  seek: string[];
  populate: string[];
};

export type AbiEventMapping = {
  type: string;
  abi: string;
  address: string;
  eventFilter: {
    fromBlock: BigInt | string;
    toBlock: BigInt | string;
    args: any;
  };
  seek: string[];
  populate: string[];
};

export type FetchIpfsJsonMapping = {
  type: string;
  ipfsUri: string;
  seek: string[];
  populate: string[];
};

export type RealityMapping = {
  type: "reality";
  realityQuestionID: string;
};

export type ActionMapping =
  | SubgraphMapping
  | AbiEventMapping
  | AbiCallMapping
  | JsonMapping
  | FetchIpfsJsonMapping
  | RealityMapping;
