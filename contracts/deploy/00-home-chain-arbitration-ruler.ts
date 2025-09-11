import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped } from "./utils";
import { deployERC20AndFaucet } from "./utils/deployTokens";
import { KlerosCoreRuler } from "../typechain-types";
import { getContractOrDeploy, getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";
import { changeCurrencyRate } from "./utils/klerosCoreHelper";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnk = await deployERC20AndFaucet(hre, deployer, "PNK");
  const dai = await deployERC20AndFaucet(hre, deployer, "DAI");
  const weth = await deployERC20AndFaucet(hre, deployer, "WETH");

  await getContractOrDeploy(hre, "TransactionBatcher", { from: deployer, args: [], log: true });

  const minStake = 0;
  const alpha = 10000;
  const feeForJuror = 10n ** 17n;
  const jurorsForCourtJump = 16;
  await deployUpgradable(deployments, "KlerosCoreRuler", {
    from: deployer,
    args: [
      deployer, // owner
      pnk.target,
      [minStake, alpha, feeForJuror, jurorsForCourtJump],
    ],
    log: true,
  });
  const core = await hre.ethers.getContract<KlerosCoreRuler>("KlerosCoreRuler");

  try {
    await changeCurrencyRate(core, await pnk.getAddress(), true, 12225583, 12);
    await changeCurrencyRate(core, await dai.getAddress(), true, 60327783, 11);
    await changeCurrencyRate(core, await weth.getAddress(), true, 1, 1);
  } catch (e) {
    console.error("failed to change currency rates:", e);
  }

  const disputeTemplateRegistry = await getContractOrDeployUpgradable(hre, "DisputeTemplateRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  await deploy("DisputeResolverRuler", {
    from: deployer,
    args: [core.target, disputeTemplateRegistry.target],
    log: true,
  });
};

deployArbitration.tags = ["ArbitrationRuler"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
