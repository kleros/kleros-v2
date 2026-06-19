import { task } from "hardhat/config";
import { prompt, print } from "gluegun";
import { getContracts } from "./utils/contracts";
import { isAddress } from "viem";

const { bold } = print.colors;

task("change-owner", "Changes the owner for all the contracts")
  .addPositionalParam("newOwner", "The address of the new owner")
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

    const {
      core,
      disputeKitClassic,
      disputeKitClassicUniversity,
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
    } = await getContracts(hre);

    const updateOwner = async (
      contractName: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contractInstance: any
    ) => {
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
    if (disputeKitClassicUniversity) await updateOwner("DisputeKitClassicUniversity", disputeKitClassicUniversity);
    if (disputeKitShutter) await updateOwner("DisputeKitShutter", disputeKitShutter);
    if (disputeKitGated) await updateOwner("DisputeKitGated", disputeKitGated);
    if (disputeKitGatedShutter) await updateOwner("DisputeKitGatedShutter", disputeKitGatedShutter);
    if (chainlinkRng) await updateOwner("ChainlinkRNG", chainlinkRng);
    if (rngWithFallback) await updateOwner("RNGWithFallback", rngWithFallback);
    if (randomizerRng) await updateOwner("RandomizerRNG", randomizerRng);

    print.success("Owner changed successfully");
  });
