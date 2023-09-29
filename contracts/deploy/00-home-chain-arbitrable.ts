import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import disputeTemplate from "../test/fixtures/DisputeTemplate.simple.json";
import { HomeChains, isSkipped } from "./utils";
import { deployUpgradable } from "./utils/deployUpgradable";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const klerosCore = await deployments.get("KlerosCore");
  const extraData =
    "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003"; // General court, 3 jurors
  const weth = await deployments.get("WETH");

  const disputeTemplateRegistry = await deployUpgradable(hre, "DisputeTemplateRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  await deploy("ArbitrableExample", {
    from: deployer,
    args: [
      klerosCore.address,
      disputeTemplate,
      "disputeTemplateMapping: TODO",
      extraData,
      disputeTemplateRegistry.address,
      weth.address,
    ],
    log: true,
  });

  await deploy("DisputeResolver", {
    from: deployer,
    args: [klerosCore.address, disputeTemplateRegistry.address],
    log: true,
  });
};

deployArbitration.tags = ["HomeArbitrable"];
deployArbitration.dependencies = ["Arbitration"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
