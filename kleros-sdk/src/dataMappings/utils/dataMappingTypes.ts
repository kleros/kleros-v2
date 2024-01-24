export type JsonMapping = {
  value: object; // Hardcoded object, to be stringified.
  seek: string[]; // JSON keys used to populate the template variables
  populate: string[]; // Populated template variables
};

export type SubgraphMapping = {
  endpoint: string; // Subgraph endpoint
  query: string; // Subgraph query
  variables?: { [k: string]: any }; // Subgraph query variables
  seek: string[]; // Subgraph query parameters value used to populate the template variables
  populate: string[]; // Populated template variables
};

export type AbiCallMapping = {
  abi: string; // ABI of the contract emitting the event
  address: string; // Address of the contract emitting the event
  args: any[]; // Function arguments
  seek: string[]; // Call return parameters used to populate the template variables
  populate: string[]; // Populated template variables
};

export type AbiEventMapping = {
  abi: string; // ABI of the contract emitting the event
  address: string; // Address of the contract emitting the event
  eventFilter: {
    // Event filter (eg. specific parameter value, block number range, event index)
    fromBlock: BigInt | string; // Block number range start
    toBlock: BigInt | string; // Block number range end
    args?: any; // Event parameter value to filter on
  };
  seek: string[]; // Event parameters value used to populate the template variables
  populate: string[]; // Populated template variables
};

export type FetchIpfsJsonMapping = {
  ipfsUri: string; // IPFS URL
  seek: string[]; // JSON keys used to populate the template variables
  populate: string[]; // Populated template variables
};

export type RealityMapping = {
  realityQuestionID: string;
};

export type DataMapping<
  T extends SubgraphMapping | AbiEventMapping | AbiCallMapping | JsonMapping | FetchIpfsJsonMapping | RealityMapping
> = {
  type: string;
} & T;

const subgraphMappingExample: SubgraphMapping = {
  endpoint: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
  query: `
        query($id: ID!) {
            pair(id: $id) {
                id
                token0Price
                token1Price
            }
        }
    `,
  seek: ["token0Price", "token1Price"],
  populate: ["price1", "price2"],
};

const abiEventMappingExample: AbiEventMapping = {
  abi: "event StakeSet(address indexed _address, uint256 _courtID, uint256 _amount)",
  address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
  eventFilter: {
    fromBlock: BigInt(36205881),
    toBlock: "latest",
    args: {
      _courtID: 1,
    },
  },
  seek: ["amount"],
  populate: ["amount"],
};

const abiCallMappingExample: AbiCallMapping = {
  abi: "function appealCost(uint256 _disputeID) public view returns (uint256)",
  address: "0x5a2bC1477ABE705dB4955Cda7DE064eA79D563d1",
  args: [BigInt(1)],
  seek: ["cost"],
  populate: ["cost"],
};

const jsonMappingExample: JsonMapping = {
  value: {
    name: "John Doe",
    age: 30,
    email: "johndoe@example.com",
  },
  seek: ["name", "age", "email"],
  populate: ["name", "age", "email"],
};

const fetchIpfsJsonMappingExample: FetchIpfsJsonMapping = {
  ipfsUri: "ipfs://QmZ3Cmnip8bmFNruuTuCdxPymEjyK9VcQEyf2beDYcaHaK/metaEvidence.json",
  seek: ["title"],
  populate: ["title"],
};
