import { type Address, type BlockNumber, type BlockTag } from "viem";

type MappingType = "graphql" | "abi/call" | "abi/event" | "json" | "fetch/ipfs/json" | "reality";

type AbstractMapping<T extends MappingType> = {
  type: T;
  seek: string[];
  populate: string[];
};

export type JsonMapping = AbstractMapping<"json"> & {
  value: object;
};

export type SubgraphMapping = AbstractMapping<"graphql"> & {
  endpoint: string;
  query: string;
  variables: { [key: string]: unknown };
};

export type AbiCallMapping = AbstractMapping<"abi/call"> & {
  abi: string;
  address: Address;
  functionName: string;
  args: any[];
};

export type AbiEventMapping = AbstractMapping<"abi/event"> & {
  abi: string;
  address: Address;
  eventFilter: {
    fromBlock: BlockNumber | BlockTag;
    toBlock: BlockNumber | BlockTag;
    args: any;
  };
};

export type FetchIpfsJsonMapping = AbstractMapping<"fetch/ipfs/json"> & {
  ipfsUri: string;
};

export type RealityMapping = AbstractMapping<"reality"> & {
  realityQuestionID: string;
};

export type ActionMapping =
  | SubgraphMapping
  | AbiEventMapping
  | AbiCallMapping
  | JsonMapping
  | FetchIpfsJsonMapping
  | RealityMapping;
