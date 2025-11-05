import { task } from "hardhat/config";
import { prompt, print } from "gluegun";
import { Cores, getContracts } from "./utils/contracts";
import { isAddress } from "viem";

const { bold } = print.colors;

task("change-owner", "Changes the owner for all the contracts")
  .addPositionalParam("newOwner", "The address of the new owner")
  .addOptionalParam("coreType", "The type of core to use between base, university (default: base)", Cores.BASE)
  .setAction(async (taskArgs, hre) => {
    const newOwner = taskArgs.newOwner;
    if (!isAddress(newOwner)) {
      throw new Error("Invalid owner address provided");
    }
    print.highlight(`💣 Changing owner to ${bold(newOwner)}`);

    const { confirm } = await prompt.ask({
      type: "confirm",
      name: "confirm",
      message: "Are you sure you want to proceed?",
    });
    if (!confirm) {
      console.log("Operation cancelled by user.");
      return;
    }

    const coreType = Cores[taskArgs.coreType.toUpperCase() as keyof typeof Cores];
    if (coreType === undefined) {
      console.error("Invalid core type, must be one of base, university");
      return;
    }
    console.log("Using core type %s", coreType);

    const {
      core,
      disputeKitClassic,
      disputeKitShutter,
      disputeKitGated,
      disputeKitGatedShutter,
      disputeResolver,
      disputeTemplateRegistry,
      policyRegistry,
      chainlinkRng,
      rngWithFallback,
      randomizerRng,
      snapshotProxy,
      sortition,
      evidence,
    } = await getContracts(hre, coreType);

    const updateOwner = async (contractName: string, contractInstance: any) => {
      print.info(`Changing owner for ${contractName}`);

      const spinner = print.spin(`Executing transaction for ${contractName}...`);
      try {
        const tx = await contractInstance.changeOwner(newOwner);
        await tx.wait();
        spinner.succeed(`Owner changed for ${contractName}, tx hash: ${tx.hash}`);
      } catch (error) {
        if (error instanceof Error) {
          spinner.fail(`Failed to change owner for ${contractName}: ${error.message}`);
        } else {
          spinner.fail(`Failed to change owner for ${contractName}: ${String(error)}`);
        }
      }
    };

    await updateOwner("KlerosCore", core);
    await updateOwner("DisputeKitClassic", disputeKitClassic);
    await updateOwner("DisputeResolver", disputeResolver);
    await updateOwner("DisputeTemplateRegistry", disputeTemplateRegistry);
    await updateOwner("PolicyRegistry", policyRegistry);
    await updateOwner("KlerosCoreSnapshotProxy", snapshotProxy);
    await updateOwner("SortitionModule", sortition);
    await updateOwner("EvidenceModule", evidence);
    if (disputeKitShutter) await updateOwner("DisputeKitShutter", disputeKitShutter);
    if (disputeKitGated) await updateOwner("DisputeKitGated", disputeKitGated);
    if (disputeKitGatedShutter) await updateOwner("DisputeKitGatedShutter", disputeKitGatedShutter);
    if (chainlinkRng) await updateOwner("ChainlinkRNG", chainlinkRng);
    if (rngWithFallback) await updateOwner("RNGWithFallback", rngWithFallback);
    if (randomizerRng) await updateOwner("RandomizerRNG", randomizerRng);

    print.success("Owner changed successfully");
  });
