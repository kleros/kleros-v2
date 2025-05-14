import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { prompt, print } from "gluegun";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped } from "./utils";
import { getContractNamesFromNetwork } from "../scripts/utils/contracts";

const { bold } = print.colors;

const deployUpgradeAll: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("upgrading on %s with deployer %s", HomeChains[chainId], deployer);

  const { disputeKitClassic, disputeTemplateRegistry, evidence, core, policyRegistry, sortition } =
    await getContractNamesFromNetwork(hre);

  const upgrade = async (contractName: string, initializer: string, args: any[]) => {
    try {
      print.highlight(`🔍 Validating upgrade of ${bold(contractName)}`);
      await hre.run("compare-storage", { contract: contractName });
      print.newline();
      print.highlight(`💣 Upgrading ${bold(contractName)}`);
      const { confirm } = await prompt.ask({
        type: "confirm",
        name: "confirm",
        message: "Are you sure you want to proceed?",
      });
      if (!confirm) {
        print.info("Operation cancelled by user.");
        return;
      }
      print.info(`Upgrading ${contractName}...`);

      await deployUpgradable(deployments, contractName, {
        newImplementation: contractName,
        initializer,
        from: deployer,
        args, // Warning: do not reinitialize existing state variables, only the new ones
      });

      print.info(`Verifying ${contractName} on Etherscan...`);
      await hre.run("etherscan-verify", { contractName: `${contractName}_Implementation` });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  await upgrade(disputeKitClassic, "initialize5", []);
  await upgrade(disputeTemplateRegistry, "initialize2", []);
  await upgrade(evidence, "initialize2", []);
  await upgrade(core, "initialize4", []);
  await upgrade(policyRegistry, "initialize2", []);
  await upgrade(sortition, "initialize3", []);
};

deployUpgradeAll.tags = ["UpgradeAll"];
deployUpgradeAll.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployUpgradeAll;
