import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("storage-layout", "Prints the storage layout of a contract").setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    await hre.run("compile");
    const buildInfo = await hre.artifacts.getBuildInfo(`src/arbitration/KlerosCore.sol:KlerosCore`);
    console.log(buildInfo.output.contracts["src/arbitration/KlerosCore.sol"]["KlerosCore"].storageLayout);
  }
);
