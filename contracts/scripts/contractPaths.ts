import { existsSync } from "fs";
import { join } from "path";

const PIN_FOLDERS = ["pin/version", "pin/package.json", "pin/solidity.json", "pin/src", "pin/deploy", "pin/scripts"];
export const pinActive = PIN_FOLDERS.every(existsSync);

export const sourcesDir = pinActive ? "./pin/src" : "./src";
export const artifactsDir = pinActive ? "./pin/artifacts" : "./artifacts";
export const deployDir = pinActive ? "./pin/deploy" : "./deploy";
export const hardhatCacheDir = pinActive ? "./pin/cache" : "./cache_hardhat";

// Hardhat mirrors the sources path under artifacts/ (pin/src -> pin/artifacts/pin/src)
const stripDotSlash = (p: string) => p.replace(/^\.\//, "");
export const artifactsSourceDir = join(stripDotSlash(artifactsDir), stripDotSlash(sourcesDir));

export const contractFqn = (relativePath: string, contractName: string) => {
  const root = stripDotSlash(sourcesDir);
  return `${root}/${relativePath}:${contractName}`;
};
