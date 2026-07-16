import { readFileSync } from "fs";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { pinActive } from "./contractPaths";

const LOCAL_NETWORKS = new Set(["hardhat", "localhost"]);

export const assertPinLocalhostOnly = (hre: HardhatRuntimeEnvironment) => {
  if (!pinActive || LOCAL_NETWORKS.has(hre.network.name)) return;

  const ref = readFileSync("pin/version", "utf8").trim();
  throw new Error(
    `Pinned to ${ref}: only hardhat/localhost allowed (got "${hre.network.name}"). Run 'yarn unpin' first.`
  );
};

const guardTask = (name: string) => {
  task(name).setAction(async (args, hre, runSuper) => {
    assertPinLocalhostOnly(hre);
    return runSuper(args);
  });
};

guardTask("deploy");
guardTask("populate:courts");
guardTask("populate:policy-registry");
