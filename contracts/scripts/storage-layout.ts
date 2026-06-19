import { task } from "hardhat/config";
import { CompilerOutputContract, HardhatRuntimeEnvironment } from "hardhat/types";

type ContractOutputWithStorageLayout = CompilerOutputContract & {
  storageLayout?: unknown;
};

task("storage-layout", "Prints the storage layout of a contract").setAction(
  async (_, hre: HardhatRuntimeEnvironment) => {
    await hre.run("compile");
    const buildInfo = await hre.artifacts.getBuildInfo(`src/arbitration/KlerosCore.sol:KlerosCore`);
    if (!buildInfo) {
      throw new Error("Build info not found for src/arbitration/KlerosCore.sol:KlerosCore");
    }
    const contractOutput = buildInfo.output.contracts["src/arbitration/KlerosCore.sol"][
      "KlerosCore"
    ] as ContractOutputWithStorageLayout;
    if (!contractOutput) {
      throw new Error("Contract output not found for src/arbitration/KlerosCore.sol:KlerosCore");
    }
    console.log(contractOutput.storageLayout);
  }
);
