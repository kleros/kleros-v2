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

export type ActionMapping = SubgraphMapping | AbiEventMapping | AbiCallMapping | JsonMapping;
