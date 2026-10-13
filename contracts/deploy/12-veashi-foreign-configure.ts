import { getAddress } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ForeignGateway__factory, HomeGateway__factory } from "../typechain-types";
import {
  assertNoProblems,
  counterpartDeployment,
  counterpartProvider,
  DEPLOYMENT_NAMES,
  deployerAddress,
  foreignProblems,
  mirrorProblems,
  readForeignGateway,
  readHomeGateway,
  skipUnlessVeashiChain,
  VEASHI_TAGS,
  veashiParameters,
} from "./utils/veashi";

// Veashi, step 3 of 3, on Base: point the ForeignGateway at the HomeGateway, set the juror fee of the Lightbulb's
// court, the bridging cost of every oracle, accept USDC at a non-zero rate, then read both gateways back.
// Needs deployments/arbitrum/VeashiHomeGateway.json from step 2 and the arbitrum RPC (ARBITRUM_RPC) for the read-back.
// Every call is made by the governor (the deployer) and skipped when the value is already set: re-running is safe.

const SCRIPT = "12-veashi-foreign-configure";

const configureVeashiForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const p = veashiParameters(hre, "foreign");
  const deployer = await deployerAddress(hre);
  console.log("Veashi %s: %s parameters, deployer %s", SCRIPT, p.set, deployer);
  const foreignDeployment = await hre.deployments.get(DEPLOYMENT_NAMES.foreignGateway);
  const homeDeployment = await counterpartDeployment(hre, "foreign", DEPLOYMENT_NAMES.homeGateway);
  const gateway = ForeignGateway__factory.connect(foreignDeployment.address, await hre.ethers.getSigner(deployer));
  const send = async (what: string, tx: Promise<{ wait: () => Promise<unknown> }>) => {
    await (await tx).wait();
    console.log("Veashi %s: %s", SCRIPT, what);
  };

  if (getAddress(await gateway.homeGateway()) !== getAddress(homeDeployment.address)) {
    await send(`changeHomeGateway(${homeDeployment.address})`, gateway.changeHomeGateway(homeDeployment.address));
  }
  // A court whose fee is 0 falls back to court 0 in the gateway: the Lightbulb's court gets its own fee.
  if ((await gateway.feeForJuror(p.court.id)) !== p.court.feeForJuror) {
    await send(
      `changeCourtJurorFee(${p.court.id}, ${p.court.feeForJuror})`,
      gateway.changeCourtJurorFee(p.court.id, p.court.feeForJuror)
    );
  }
  for (const oracle of p.oracles) {
    if ((await gateway.oracleBridgingCost(oracle.id)) !== oracle.bridgingCost) {
      await send(
        `setOracleBridgingCost(${oracle.id} ${oracle.bridge}, ${oracle.bridgingCost})`,
        gateway.setOracleBridgingCost(oracle.id, oracle.bridgingCost)
      );
    }
  }
  const usdc = await gateway.currencyRates(p.usdc.address);
  if (!usdc.feePaymentAccepted) {
    await send(
      `changeAcceptedFeeTokens(${p.usdc.address}, true)`,
      gateway.changeAcceptedFeeTokens(p.usdc.address, true)
    );
  }
  if (usdc.rateInEth !== p.usdc.rateInEth || Number(usdc.rateDecimals) !== p.usdc.rateDecimals) {
    await send(
      `changeCurrencyRates(${p.usdc.address}, ${p.usdc.rateInEth}, ${p.usdc.rateDecimals})`,
      gateway.changeCurrencyRates(p.usdc.address, p.usdc.rateInEth, p.usdc.rateDecimals)
    );
  }

  // Read-back on both chains: the ForeignGateway against the parameters, the HomeGateway against the ForeignGateway.
  const foreign = await readForeignGateway(gateway, p);
  assertNoProblems(
    "ForeignGateway",
    foreignProblems(foreign, p, {
      governor: deployer,
      homeGateway: homeDeployment.address,
    })
  );
  const homeGateway = HomeGateway__factory.connect(homeDeployment.address, await counterpartProvider(hre, "foreign"));
  assertNoProblems("gateway mirror", mirrorProblems(foreign, await readHomeGateway(homeGateway)));
  console.log("Veashi %s: ForeignGateway %s configured and read back; oracle lists mirror", SCRIPT, foreign.address);
};

configureVeashiForeignGateway.tags = [VEASHI_TAGS.foreignConfigure];
configureVeashiForeignGateway.skip = async ({ network }) => skipUnlessVeashiChain(network, "foreign", SCRIPT);

export default configureVeashiForeignGateway;
