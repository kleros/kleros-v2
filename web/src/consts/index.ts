import { version, gitCommitHash, gitCommitShortHash, gitBranch, gitTags, clean } from "../generatedGitInfo.json";

export const ONE_BASIS_POINT = 10000n;

export const KLEROS_CONTRACT_ADDRESS = "ethereum:0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d";
export const WETH_CONTRACT_ADDRESS = "ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const PNK_FAUCET_CONTRACT_ADDRESS = "0x05648Ee14941630a649082e0dA5cb80D29cC9002";

export const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY || "https://cdn.kleros.link";

export const GIT_BRANCH = gitBranch;
export const GIT_TAGS = gitTags;
export const GIT_HASH = gitCommitShortHash;
export const GIT_DIRTY = clean ? "" : "-dirty";
export const GIT_URL = `https://github.com/kleros/kleros-v2/tree/${gitCommitHash}/web`;
export const RELEASE_VERSION = version;
