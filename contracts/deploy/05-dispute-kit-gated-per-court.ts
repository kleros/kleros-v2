import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployUpgradable } from "./utils/deployUpgradable";
import { Courts, HomeChains, isSkipped } from "./utils";
import { findDisputeKitID } from "./utils/klerosCoreHelper";
import { DisputeKitGatedPerCourt, KlerosCore } from "../typechain-types";

// V2 testnet (KlerosCore BASE) counterpart of 05-dispute-kit-gated-per-court-neo.ts.
// Human Passport is not deployed on Arbitrum Sepolia: PassportDecoderMock is used instead, anyone can set scores on it.
// Per network name, as the devnet and the testnet share the same chain.
// - testnet: 8 (Agentic Commerce) and its parent 7 (Commerce), gated by Human Passport score in 7 only,
//   mirroring the Arbitrum One setup for courts 34 and 33.
// - hardhat/localhost (local testing): the General court, gated by Human Passport score.
const CONFIG: Record<string, { courts: number[]; passportGates: Record<number, bigint> }> = {
  arbitrumSepolia: { courts: [8, 7], passportGates: { 7: 200000n } }, // 200000 is a score of 20
  hardhat: { courts: [Courts.GENERAL], passportGates: { [Courts.GENERAL]: 200000n } },
  localhost: { courts: [Courts.GENERAL], passportGates: { [Courts.GENERAL]: 200000n } },
};

const deployDisputeKitGatedPerCourt: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, network } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s (%s) with deployer %s", HomeChains[chainId], network.name, deployer);
  const config = CONFIG[network.name];

  const core = await ethers.getContract<KlerosCore>("KlerosCore");
  const weth = await deployments.get("WETH");

  const passportDecoder = await deployments.deploy("PassportDecoderMock", {
    from: deployer,
    args: [],
    log: true,
  });

  const deployment = await deployUpgradable(deployments, "DisputeKitGatedPerCourt", {
    from: deployer,
    args: [deployer, core.target, weth.address, passportDecoder.address],
    log: true,
  }); // proxy contract: DisputeKitGatedPerCourtProxy
  const disputeKit = await ethers.getContract<DisputeKitGatedPerCourt>("DisputeKitGatedPerCourt");

  const governor = await core.governor();
  const isGovernor = governor.toLowerCase() === deployer.toLowerCase();
  if (!isGovernor) {
    console.warn(
      "deployer %s is not the KlerosCore governor (%s), core txs will be printed, not sent",
      deployer,
      governor
    );
  }

  // Register the dispute kit in the core only if not already registered
  let disputeKitID = await findDisputeKitID(core, deployment.address);
  if (disputeKitID === undefined) {
    console.log(`core.addNewDisputeKit(${deployment.address})`);
    if (isGovernor) {
      await (await core.addNewDisputeKit(deployment.address)).wait();
      disputeKitID = await findDisputeKitID(core, deployment.address);
      if (disputeKitID === undefined) throw new Error("DisputeKitGatedPerCourt not found in core after registration");
    }
  }

  // Enable the dispute kit in the configured courts, skipping the courts already supporting it
  if (disputeKitID === undefined) {
    console.log("REMINDER: once registered, enable the dispute kit in courts [%s]", config.courts.join(", "));
  } else {
    console.log("DisputeKitGatedPerCourt has disputeKitID %d", disputeKitID);
    for (const courtID of config.courts) {
      if (await core.isSupported(courtID, disputeKitID)) {
        console.log("court %d already supports disputeKitID %d, skipping", courtID, disputeKitID);
        continue;
      }
      console.log(`core.enableDisputeKits(${courtID}, [${disputeKitID}], true)`);
      if (isGovernor) await (await core.enableDisputeKits(courtID, [disputeKitID], true)).wait();
    }
  }

  // The initializer does not run again on a redeployment of the mock: point the dispute kit to the current one
  const dkGovernor = await disputeKit.governor();
  const isDKGovernor = dkGovernor.toLowerCase() === deployer.toLowerCase();
  if ((await disputeKit.passportDecoder()).toLowerCase() !== passportDecoder.address.toLowerCase()) {
    console.log(`disputeKit.changePassportDecoder(${passportDecoder.address})`);
    if (isDKGovernor) await (await disputeKit.changePassportDecoder(passportDecoder.address)).wait();
    else console.warn("deployer %s is not the dispute kit governor (%s), tx not sent", deployer, dkGovernor);
  }

  // Configure the Human Passport gates, the deployer being the dispute kit governor on a fresh deployment
  for (const [courtID, minScore] of Object.entries(config.passportGates)) {
    if ((await disputeKit.courtMinPassportScores(courtID)) === minScore) continue;
    console.log(`disputeKit.changeCourtMinPassportScore(${courtID}, ${minScore})`);
    if (!isDKGovernor) {
      console.warn("deployer %s is not the dispute kit governor (%s), tx not sent", deployer, dkGovernor);
      continue;
    }
    await (await disputeKit.changeCourtMinPassportScore(courtID, minScore)).wait();
  }
  console.log(
    "REMINDER: set the jurors' Human Passport scores on PassportDecoderMock (%s) with setScore(juror, score), " +
      "with 4 decimals, e.g. 200000 for a score of 20.",
    passportDecoder.address
  );
};

deployDisputeKitGatedPerCourt.tags = ["DisputeKitGatedPerCourt"];
// No `dependencies = ["Arbitration"]` on purpose: hardhat-deploy re-runs dependencies on every run.
// Locally, run both tags: `hardhat deploy --tags Arbitration,DisputeKitGatedPerCourt` (files run in name order).
deployDisputeKitGatedPerCourt.skip = async ({ network }) => {
  return isSkipped(network, CONFIG[network.name] === undefined);
};

export default deployDisputeKitGatedPerCourt;
