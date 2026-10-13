import { ZeroAddress } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployUpgradable } from "./utils/deployUpgradable";
import { getContractOrDeploy } from "./utils/getContractOrDeploy";
import {
  DEPLOYMENT_NAMES,
  deployerAddress,
  lightbulbExtraData,
  skipUnlessVeashiChain,
  VEASHI_TAGS,
  veashiParameters,
} from "./utils/veashi";

// Veashi, step 1 of 3, on Base: the ForeignGateway proxy (home gateway left as a placeholder) and the GatewayLightbulb.
// Then 11-veashi-home-gateway on Arbitrum, then 12-veashi-foreign-configure on Base.
// Parameters: deploy/utils/veashi/parameters.ts. Requires VEASHI_KEEPER_ADDRESS (the bot's address) on a live network.

const SCRIPT = "10-veashi-foreign-gateway";

const deployVeashiForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  // Validated before any transaction: oracles, selection, threshold, fees, rates and the keeper.
  const p = veashiParameters(hre, "foreign");
  const deployer = await deployerAddress(hre);
  console.log("Veashi %s: %s parameters, deployer %s, keeper %s", SCRIPT, p.set, deployer, p.keeper);

  // `initialize` is final: changeYaho, changeYaru and setOracleEnabled revert NotImplemented. Only the home gateway is
  // a placeholder (the zero address: no message can come from it), set by 12-veashi-foreign-configure.
  const foreign = p.addresses.foreign;
  const gateway = await deployUpgradable(hre.deployments, DEPLOYMENT_NAMES.foreignGateway, {
    contract: "ForeignGateway",
    proxyAlias: "UUPSProxy",
    from: deployer,
    args: [
      deployer, // governor
      p.keeper,
      p.homeChainId,
      ZeroAddress, // home gateway placeholder
      foreign.yaho,
      foreign.yaru,
      p.homeNativeRate,
      foreign.oracles.map((oracle) => ({ ...oracle, enabled: true })), // IDs 0..n-1 in order
      p.defaultOracleIds,
      p.defaultThreshold,
    ],
    log: true,
  });

  await getContractOrDeploy(hre, DEPLOYMENT_NAMES.lightbulb, {
    contract: "GatewayLightbulb",
    from: deployer,
    args: [gateway.address, lightbulbExtraData(p), p.lightbulb.templateId, p.lightbulb.templateUri],
    log: true,
  });
};

deployVeashiForeignGateway.tags = [VEASHI_TAGS.foreign];
deployVeashiForeignGateway.skip = async ({ network }) => skipUnlessVeashiChain(network, "foreign", SCRIPT);

export default deployVeashiForeignGateway;
