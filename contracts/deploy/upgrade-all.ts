import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { prompt, print } from "gluegun";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped } from "./utils";
import { getContractNames, getContractNamesFromNetwork } from "../scripts/utils/contracts";

const { bold } = print.colors;

const deployUpgradeAll: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("upgrading on %s with deployer %s", HomeChains[chainId], deployer);

  const {
    disputeKitClassic,
    disputeKitShutter,
    disputeKitGated,
    disputeKitGatedShutter,
    disputeTemplateRegistry,
    evidence,
    core,
    policyRegistry,
    sortition,
  } = await getContractNamesFromNetwork(hre);

  console.log("disputeKitClassic", disputeKitClassic);
  console.log("disputeKitShutter", disputeKitShutter);
  console.log("disputeKitGated", disputeKitGated);
  console.log("disputeKitGatedShutter", disputeKitGatedShutter);

  const upgrade = async (contractName: string, initializer: string, args: any[]) => {
    try {
      print.highlight(`🔍 Validating upgrade of ${bold(contractName)}`);

      const contractNameWithoutNeo = contractName.replace(/Neo.*$/, "");
      let compareStorageOptions = { contract: contractName } as any;
      if (hre.network.name === "arbitrum") {
        switch (contractName) {
          case "KlerosCoreNeo":
          case "SortitionModuleNeo":
            compareStorageOptions = { deployedArtifact: `${contractName}_Implementation`, contract: contractName };
            break;
          default:
            compareStorageOptions = {
              deployedArtifact: `${contractName}_Implementation`,
              contract: contractNameWithoutNeo,
            };
        }
      }
      await hre.run("compare-storage", compareStorageOptions);
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

      switch (contractName) {
        case "DisputeKitClassicNeo":
        case "DisputeResolverNeo":
          await deployUpgradable(deployments, contractName, {
            contract: contractName,
            newImplementation: contractNameWithoutNeo,
            initializer,
            from: deployer,
            args, // Warning: do not reinitialize existing state variables, only the new ones
          });
          break;
        default:
          await deployUpgradable(deployments, contractName, {
            newImplementation: contractName,
            initializer,
            from: deployer,
            args, // Warning: do not reinitialize existing state variables, only the new ones
          });
      }
      print.info(`Verifying ${contractName} on Etherscan...`);
      await hre.run("etherscan-verify", { contractName: `${contractName}_Implementation` });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const wETH = await deployments.get("WETH");

  await upgrade(disputeKitClassic, "reinitialize", [wETH.address]);
  await upgrade(disputeKitShutter, "reinitialize", [wETH.address]);
  await upgrade(disputeKitGated, "reinitialize", [wETH.address]);
  await upgrade(disputeKitGatedShutter, "reinitialize", [wETH.address]);
  await upgrade(disputeTemplateRegistry, "initialize2", []);
  await upgrade(evidence, "initialize2", []);
  await upgrade(core, "reinitialize", [wETH.address]);
  await upgrade(policyRegistry, "initialize2", []);
  await upgrade(sortition, "initialize4", []);
};

deployUpgradeAll.tags = ["UpgradeAll"];
deployUpgradeAll.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployUpgradeAll;
