import { task } from "hardhat/config";
import { CompilerOutputContract, HardhatRuntimeEnvironment } from "hardhat/types";
import { contractFqn } from "./contractPaths";

type ContractOutputWithStorageLayout = CompilerOutputContract & {
  storageLayout?: unknown;
};

const KLEROS_CORE = contractFqn("arbitration/KlerosCore.sol", "KlerosCore");
const KLEROS_CORE_FILE = KLEROS_CORE.split(":")[0];

task("storage-layout", "Prints the storage layout of a contract").setAction(
  async (_, hre: HardhatRuntimeEnvironment) => {
    await hre.run("compile");
    const buildInfo = await hre.artifacts.getBuildInfo(KLEROS_CORE);
    if (!buildInfo) {
      throw new Error(`Build info not found for ${KLEROS_CORE}`);
    }
    const contractOutput = buildInfo.output.contracts[KLEROS_CORE_FILE][
      "KlerosCore"
    ] as ContractOutputWithStorageLayout;
    if (!contractOutput) {
      throw new Error(`Contract output not found for ${KLEROS_CORE}`);
    }
    console.log(contractOutput.storageLayout);
  }
);
