import { ArbitratorTypes, getArbitratorType as _getArbitratorType } from "consts/arbitratorTypes";

import { version, gitCommitHash, gitCommitShortHash, gitBranch, gitTags, clean } from "../generatedGitInfo.json";

export { ArbitratorTypes };

export const ONE_BASIS_POINT = 10000n;

export const REFETCH_INTERVAL = 5000;

export const IPFS_GATEWAY = import.meta.env.REACT_APP_IPFS_GATEWAY || "https://cdn.kleros.link";
export const HERMES_TELEGRAM_BOT_URL =
  import.meta.env.REACT_APP_HERMES_TELEGRAM_BOT_URL || "https://t.me/HermesTheKlerosV2MessengerBot";

export const GIT_BRANCH = gitBranch;
export const GIT_TAGS = gitTags;
export const GIT_HASH = gitCommitShortHash;
export const GIT_DIRTY = clean ? "" : "-dirty";
export const GIT_URL = `https://github.com/kleros/kleros-v2/tree/${gitCommitHash}/web`;
export const RELEASE_VERSION = version;

// https://www.w3.org/TR/2012/WD-html-markup-20120329/input.email.html#input.email.attrs.value.single
// eslint-disable-next-line security/detect-unsafe-regex
export const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const TELEGRAM_REGEX = /^@\w{5,32}$/;
export const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
export const ETH_SIGNATURE_REGEX = /^0x[a-fA-F0-9]{130}$/;

export const isProductionDeployment = () => import.meta.env.REACT_APP_DEPLOYMENT === "mainnet";

export const isKlerosUniversity = () => getArbitratorType() === ArbitratorTypes.university;
export const isKlerosNeo = () => getArbitratorType() === ArbitratorTypes.neo;
export const getArbitratorType = (): ArbitratorTypes =>
  _getArbitratorType(import.meta.env.REACT_APP_ARBITRATOR_TYPE?.toLowerCase());

export const getDevToolsUrl = () => import.meta.env.REACT_APP_DEVTOOLS_URL || "https://devtools.v2.kleros.builders";

export const GENESIS_BLOCK_ARBSEPOLIA = BigInt(import.meta.env.REACT_APP_GENESIS_BLOCK_ARBSEPOLIA ?? 0);
export const GENESIS_BLOCK_ARBMAINNET = BigInt(import.meta.env.REACT_APP_GENESIS_BLOCK_ARBMAINNET ?? 0);
export const genesisBlock = () => (isProductionDeployment() ? GENESIS_BLOCK_ARBMAINNET : GENESIS_BLOCK_ARBSEPOLIA);

export const INVALID_DISPUTE_DATA_ERROR = `The dispute data is not valid, please vote "Refuse to arbitrate"`;
export const RPC_ERROR = `RPC Error: Unable to fetch dispute data. Please avoid voting.`;

export const spamEvidencesIds: string[] = (import.meta.env.REACT_APP_SPAM_EVIDENCES_IDS ?? "").split(",");
