import { version, gitCommitHash, gitCommitShortHash, gitBranch, gitTags, clean } from "../generatedGitInfo.json";

export const ONE_BASIS_POINT = 10000n;

export const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY || "https://cdn.kleros.link";

export const GIT_BRANCH = gitBranch;
export const GIT_TAGS = gitTags;
export const GIT_HASH = gitCommitShortHash;
export const GIT_DIRTY = clean ? "" : "-dirty";
export const GIT_URL = `https://github.com/kleros/kleros-v2/tree/${gitCommitHash}/web`;
export const RELEASE_VERSION = version;
