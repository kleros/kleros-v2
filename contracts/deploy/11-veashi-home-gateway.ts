import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { HomeGateway__factory } from "../typechain-types";
import { deployUpgradable } from "./utils/deployUpgradable";
import {
  assertCaseCost,
  assertNoProblems,
  counterpartDeployment,
  DEPLOYMENT_NAMES,
  deployerAddress,
  deployOrReuseRuler,
  homeProblems,
  readHomeGateway,
  setManualRuling,
  skipUnlessVeashiChain,
  VEASHI_TAGS,
  veashiParameters,
} from "./utils/veashi";

// Veashi, step 2 of 3, on Arbitrum: the mock arbitrator (KlerosCoreRuler), the HomeGateway proxy with the
// ForeignGateway's oracles mirrored, then the ruler's manual mode for the HomeGateway, from the deployer, in this run.
// Needs deployments/base/VeashiForeignGateway.json from step 1.

const SCRIPT = "11-veashi-home-gateway";

const deployVeashiHomeGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const p = veashiParameters(hre, "home");
  const deployer = await deployerAddress(hre);
  console.log("Veashi %s: %s parameters, deployer %s", SCRIPT, p.set, deployer);
  const foreignGateway = await counterpartDeployment(hre, "home", DEPLOYMENT_NAMES.foreignGateway);

  const ruler = await deployOrReuseRuler(hre, p, deployer);
  await assertCaseCost(ruler, p);

  // Same oracle IDs in the same order as the ForeignGateway: oracle i's dispute-leg adapter on this chain is inbound,
  // its ruling-leg reporter here and adapter on Base are outbound.
  const home = p.addresses.home;
  const deployment = await deployUpgradable(hre.deployments, DEPLOYMENT_NAMES.homeGateway, {
    contract: "HomeGateway",
    proxyAlias: "UUPSProxy",
    from: deployer,
    args: [
      deployer, // governor
      await ruler.getAddress(),
      p.foreignChainId,
      foreignGateway.address,
      home.yaho,
      home.yaru,
      home.oracles,
    ],
    log: true,
  });

  // The first caller of changeRulingModeToManual becomes the HomeGateway's ruler, and a dispute arriving before it
  // reverts RulingModeNotSet: done now, by the deployer.
  await setManualRuling(ruler, deployment.address, deployer);

  const gateway = HomeGateway__factory.connect(deployment.address, hre.ethers.provider);
  const expected = {
    governor: deployer,
    arbitrator: await ruler.getAddress(),
    foreignGateway: foreignGateway.address,
  };
  assertNoProblems("HomeGateway", homeProblems(await readHomeGateway(gateway), p, expected));
  console.log(
    "Veashi %s: HomeGateway %s read back, ruler %s in manual mode",
    SCRIPT,
    deployment.address,
    expected.arbitrator
  );
};

deployVeashiHomeGateway.tags = [VEASHI_TAGS.home];
deployVeashiHomeGateway.skip = async ({ network }) => skipUnlessVeashiChain(network, "home", SCRIPT);

export default deployVeashiHomeGateway;
