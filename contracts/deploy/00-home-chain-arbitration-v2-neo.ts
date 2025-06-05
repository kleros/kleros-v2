import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getContractAddress } from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped, isDevnet, PNK, ETH } from "./utils";
import { getContractOrDeploy, getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";
import { deployERC20AndFaucet, deployERC721 } from "./utils/deployTokens";
import { ChainlinkRNG, DisputeKitClassic, KlerosCoreXNeo, StakeControllerNeo, VaultNeo } from "../typechain-types";

const deployArbitrationV2Neo: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;
  const { ZeroAddress } = hre.ethers;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnk = await deployERC20AndFaucet(hre, deployer, "PNK");
  const weth = await deployERC20AndFaucet(hre, deployer, "WETH");
  const nft = await deployERC721(hre, deployer, "Kleros V2 Neo Early User", "KlerosV2NeoEarlyUser");

  await getContractOrDeploy(hre, "TransactionBatcher", { from: deployer, args: [], log: true });

  await deployUpgradable(deployments, "PolicyRegistry", { from: deployer, args: [deployer], log: true });

  await deployUpgradable(deployments, "EvidenceModule", { from: deployer, args: [deployer], log: true });

  const disputeKit = await deployUpgradable(deployments, "DisputeKitClassicV2Neo", {
    from: deployer,
    contract: "DisputeKitClassic",
    args: [deployer, ZeroAddress],
    log: true,
  });

  // TODO.......

  const disputeTemplateRegistry = await getContractOrDeployUpgradable(hre, "DisputeTemplateRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  const resolver = await deploy("DisputeResolverV2Neo", {
    from: deployer,
    contract: "DisputeResolver",
    args: [core.target, disputeTemplateRegistry.target],
    log: true,
  });

  console.log(`core.changeArbitrableWhitelist(${resolver.address}, true)`);
  await core.changeArbitrableWhitelist(resolver.address, true);

  await deploy("KlerosCoreXNeoSnapshotProxy", {
    from: deployer,
    contract: "KlerosCoreSnapshotProxy",
    args: [deployer, core.target],
    log: true,
  });

  console.log("✅ V2 Neo Architecture deployment completed successfully!");
  console.log(`📦 VaultNeo: ${pnkVaultNeo.address}`);
  console.log(`🎫 stPNKNeo: ${stPNK.address}`);
  console.log(`🎯 SortitionSumTreeNeo: ${sortitionModuleV2Neo.address}`);
  console.log(`🎮 StakeControllerNeo: ${stakeControllerNeo.target}`);
  console.log(`⚖️ KlerosCoreXNeo: ${klerosCoreV2Neo.target}`);
  console.log(`🎨 JurorNFT: ${nft.target}`);
  console.log(`🔐 DisputeResolver: ${resolver.address}`);
};

deployArbitrationV2Neo.tags = ["ArbitrationV2Neo"];
deployArbitrationV2Neo.dependencies = ["ChainlinkRNG"];
deployArbitrationV2Neo.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitrationV2Neo;
