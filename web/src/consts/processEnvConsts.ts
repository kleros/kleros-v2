import { arbitrum, arbitrumSepolia } from "viem/chains";

import { ArbitratorTypes, getArbitratorType as _getArbitratorType } from "consts/arbitratorTypes";

export { ArbitratorTypes };

export const ONE_BASIS_POINT = 10000n;

export const REFETCH_INTERVAL = 5000;

export const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY || "https://cdn.kleros.link";
export const HERMES_TELEGRAM_BOT_URL =
  process.env.REACT_APP_HERMES_TELEGRAM_BOT_URL || "https://t.me/HermesTheKlerosV2MessengerBot";

// https://www.w3.org/TR/2012/WD-html-markup-20120329/input.email.html#input.email.attrs.value.single
// eslint-disable-next-line security/detect-unsafe-regex
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const TELEGRAM_REGEX = /^@\w{5,32}$/;
export const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
export const ETH_SIGNATURE_REGEX = /^0x[a-fA-F0-9]{130}$/;

export const isProductionDeployment = () => process.env.REACT_APP_DEPLOYMENT === "mainnet";

export const isKlerosUniversity = () => getArbitratorType() === ArbitratorTypes.university;
export const isKlerosNeo = () => getArbitratorType() === ArbitratorTypes.neo;
export const getArbitratorType = (): ArbitratorTypes =>
  _getArbitratorType(process.env.REACT_APP_ARBITRATOR_TYPE?.toLowerCase());

export const GENESIS_BLOCK_ARBSEPOLIA = BigInt(process.env.REACT_APP_GENESIS_BLOCK_ARBSEPOLIA ?? 0);
export const GENESIS_BLOCK_ARBMAINNET = BigInt(process.env.REACT_APP_GENESIS_BLOCK_ARBMAINNET ?? 0);
export const genesisBlock = () => (isProductionDeployment() ? GENESIS_BLOCK_ARBMAINNET : GENESIS_BLOCK_ARBSEPOLIA);

export const INVALID_DISPUTE_DATA_ERROR = `The dispute data is not valid, please vote "Refuse to arbitrate"`;
export const RPC_ERROR = `RPC Error: Unable to fetch dispute data. Please avoid voting.`;

export const DEFAULT_CHAIN = isProductionDeployment() ? arbitrum.id : arbitrumSepolia.id;
