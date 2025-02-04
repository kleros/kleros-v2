import { task } from "hardhat/config";
import { prompt, print } from "gluegun";
import { Cores, getContracts } from "./utils/contracts";

const { bold } = print.colors;

task("change-governor", "Changes the governor for all the contracts")
  .addPositionalParam("newGovernor", "The address of the new governor")
  .addOptionalParam("coreType", "The type of core to use between base, neo, university (default: base)", Cores.BASE)
  .setAction(async (taskArgs, hre) => {
    const newGovernor = taskArgs.newGovernor;
    print.highlight(`💣 Changing governor to ${bold(newGovernor)}`);

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
      console.error("Invalid core type, must be one of base, neo, university");
      return;
    }
    console.log("Using core type %s", coreType);

    const {
      core,
      disputeKitClassic,
      disputeResolver,
      disputeTemplateRegistry,
      policyRegistry,
      chainlinkRng,
      randomizerRng,
    } = await getContracts(hre, coreType);

    const updateGovernor = async (contractName: string, contractInstance: any) => {
      print.info(`Changing governor for ${contractName}`);

      const spinner = print.spin(`Executing transaction for ${contractName}...`);
      try {
        const tx = await contractInstance.changeGovernor(newGovernor);
        await tx.wait();
        spinner.succeed(`Governor changed for ${contractName}, tx hash: ${tx.hash}`);
      } catch (error) {
        if (error instanceof Error) {
          spinner.fail(`Failed to change governor for ${contractName}: ${error.message}`);
        } else {
          spinner.fail(`Failed to change governor for ${contractName}: ${String(error)}`);
        }
      }
    };

    // TODO: upgrade and add changeGovernor!
    // await updateGovernor("SortitionModule", sortition)

    await updateGovernor("KlerosCore", core);
    await updateGovernor("DisputeKitClassic", disputeKitClassic);
    await updateGovernor("DisputeResolver", disputeResolver);
    await updateGovernor("DisputeTemplateRegistry", disputeTemplateRegistry);
    await updateGovernor("PolicyRegistry", policyRegistry);
    if (chainlinkRng) await updateGovernor("ChainlinkRNG", chainlinkRng);
    if (randomizerRng) await updateGovernor("RandomizerRNG", randomizerRng);

    print.success("Governor changed successfully");
  });
