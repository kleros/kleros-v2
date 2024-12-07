import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getContractAddress } from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { changeCurrencyRate } from "./utils/klerosCoreHelper";
import { ETH, HomeChains, PNK, isSkipped } from "./utils";
import { deployERC20AndFaucet } from "./utils/deployTokens";
import { DisputeKitClassic, KlerosCoreUniversity } from "../typechain-types";
import { getContractOrDeploy, getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;
  const { ZeroAddress } = hre.ethers;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnk = await deployERC20AndFaucet(hre, deployer, "PNK");
  const dai = await deployERC20AndFaucet(hre, deployer, "DAI");
  const weth = await deployERC20AndFaucet(hre, deployer, "WETH");

  await getContractOrDeploy(hre, "TransactionBatcher", { from: deployer, args: [], log: true });

  const disputeKit = await deployUpgradable(deployments, "DisputeKitClassicUniversity", {
    from: deployer,
    contract: "DisputeKitClassic",
    args: [deployer, ZeroAddress],
    log: true,
  });

  let klerosCoreAddress = await deployments.getOrNull("KlerosCoreUniversity").then((deployment) => deployment?.address);
  if (!klerosCoreAddress) {
    const nonce = await ethers.provider.getTransactionCount(deployer);
    klerosCoreAddress = getContractAddress(deployer, nonce + 3); // deployed on the 4th tx (nonce+3): SortitionModule Impl tx, SortitionModule Proxy tx, KlerosCore Impl tx, KlerosCore Proxy tx
    console.log("calculated future KlerosCoreUniversity address for nonce %d: %s", nonce + 3, klerosCoreAddress);
  }
  const sortitionModule = await deployUpgradable(deployments, "SortitionModuleUniversity", {
    from: deployer,
    args: [deployer, klerosCoreAddress],
    log: true,
  }); // nonce (implementation), nonce+1 (proxy)

  const minStake = PNK(200);
  const alpha = 10000;
  const feeForJuror = ETH(0.1);
  const jurorsForCourtJump = 256;
  const klerosCore = await deployUpgradable(deployments, "KlerosCoreUniversity", {
    from: deployer,
    args: [
      deployer, // governor
      deployer, // instructor
      pnk.target,
      ZeroAddress, // KlerosCore is configured later
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, jurorsForCourtJump],
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      sortitionModule.address,
    ],
    log: true,
  }); // nonce+2 (implementation), nonce+3 (proxy)

  // disputeKit.changeCore() only if necessary
  const disputeKitContract = (await ethers.getContract("DisputeKitClassicUniversity")) as DisputeKitClassic;
  const currentCore = await disputeKitContract.core();
  if (currentCore !== klerosCore.address) {
    console.log(`disputeKit.changeCore(${klerosCore.address})`);
    await disputeKitContract.changeCore(klerosCore.address);
  }

  const core = (await hre.ethers.getContract("KlerosCoreUniversity")) as KlerosCoreUniversity;
  try {
    await changeCurrencyRate(core, await pnk.getAddress(), true, 12225583, 12);
    await changeCurrencyRate(core, await dai.getAddress(), true, 60327783, 11);
    await changeCurrencyRate(core, await weth.getAddress(), true, 1, 1);
  } catch (e) {
    console.error("Failed to change currency rates for token, with error:", e);
  }

  const disputeTemplateRegistry = await getContractOrDeployUpgradable(hre, "DisputeTemplateRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  await deploy("DisputeResolverUniversity", {
    from: deployer,
    contract: "DisputeResolver",
    args: [core.target, disputeTemplateRegistry.target],
    log: true,
  });
};

deployArbitration.tags = ["ArbitrationUniversity"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
