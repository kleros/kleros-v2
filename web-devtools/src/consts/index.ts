export const isProductionDeployment = () => process.env.NEXT_PUBLIC_DEPLOYMENT === "mainnet";

export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://cdn.kleros.link";

export const INVALID_DISPUTE_DATA_ERROR = `The dispute data is not valid, please vote "Refuse to arbitrate"`;
export const RPC_ERROR = `RPC Error: Unable to fetch dispute data. Please avoid voting.`;

export enum RULING_MODE {
  Manual,
  AutomaticPreset,
  RandomPreset,
}
