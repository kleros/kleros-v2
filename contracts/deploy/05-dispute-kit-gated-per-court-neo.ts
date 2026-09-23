import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployUpgradable } from "./utils/deployUpgradable";
import { Courts, HomeChains, isSkipped } from "./utils";
import { KlerosCoreNeo } from "../typechain-types";

// Courts where the dispute kit gets enabled, per chain.
// - Arbitrum One: 34 (Agentic Commerce) and its parent 33 (Commerce), so that a dispute can still use this DK
//   after a court jump from 34 to 33 (a court jump keeps the DK only if the parent court supports it).
// - Hardhat (local testing): the General court only, as the mainnet courts do not exist there.
// Arbitrum Sepolia (devnet/testnet) is skipped: it runs KlerosCore (BASE), not KlerosCoreNeo.
const COURTS_TO_ENABLE: Partial<Record<HomeChains, number[]>> = {
  [HomeChains.ARBITRUM_ONE]: [34, 33],
  [HomeChains.HARDHAT]: [Courts.GENERAL],
};

const deployDisputeKitGatedPerCourtNeo: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const core = await ethers.getContract<KlerosCoreNeo>("KlerosCoreNeo");
  const weth = await deployments.get("WETH");

  const disputeKit = await deployUpgradable(deployments, "DisputeKitGatedPerCourtNeo", {
    from: deployer,
    contract: "DisputeKitGatedPerCourt",
    args: [deployer, core.target, weth.address],
    log: true,
  }); // proxy contract: DisputeKitGatedPerCourtNeoProxy

  const governor = await core.governor();
  const isGovernor = governor.toLowerCase() === deployer.toLowerCase();
  if (!isGovernor) {
    console.warn(
      "deployer %s is not the KlerosCoreNeo governor (%s), core txs will be printed, not sent",
      deployer,
      governor
    );
  }

  // Register the dispute kit in the core only if not already registered
  let disputeKitID = await findDisputeKitID(core, disputeKit.address);
  if (disputeKitID === undefined) {
    console.log(`core.addNewDisputeKit(${disputeKit.address})`);
    if (!isGovernor) return;
    await (await core.addNewDisputeKit(disputeKit.address)).wait();
    disputeKitID = await findDisputeKitID(core, disputeKit.address);
    if (disputeKitID === undefined) throw new Error("DisputeKitGatedPerCourtNeo not found in core after registration");
  }
  console.log("DisputeKitGatedPerCourtNeo has disputeKitID %d", disputeKitID);

  // Enable the dispute kit in the configured courts, skipping the courts already supporting it
  const courts = COURTS_TO_ENABLE[chainId as HomeChains] ?? [];
  for (const courtID of courts) {
    if (await core.isSupported(courtID, disputeKitID)) {
      console.log("court %d already supports disputeKitID %d, skipping", courtID, disputeKitID);
      continue;
    }
    console.log(`core.enableDisputeKits(${courtID}, [${disputeKitID}], true)`);
    if (!isGovernor) continue;
    await (await core.enableDisputeKits(courtID, [disputeKitID], true)).wait();
  }

  // The token gates are intentionally not configured here
  console.log(
    "REMINDER: configure the token gate of each court with DisputeKitGatedPerCourtNeo.changeCourtTokenGate(courtID, token, isERC1155, tokenId), " +
      "e.g. for courts [%s]: disputeKit.changeCourtTokenGate(<courtID>, <tokenAddress>, false, 0) for an ERC20/ERC721 token. " +
      "Until then, these courts are NOT gated by this dispute kit.",
    courts.join(", ")
  );
};

const findDisputeKitID = async (core: KlerosCoreNeo, address: string): Promise<number | undefined> => {
  const length = await core.getDisputeKitsLength();
  for (let i = 1n; i < length; i++) {
    if ((await core.disputeKits(i)).toLowerCase() === address.toLowerCase()) return Number(i);
  }
  return undefined;
};

deployDisputeKitGatedPerCourtNeo.tags = ["DisputeKitGatedPerCourtNeo"];
// No `dependencies = ["ArbitrationNeo"]` on purpose: hardhat-deploy re-runs dependencies on every run, and the
// ArbitrationNeo script is not idempotent on Arbitrum One (it re-adds dispute kits, uses non-Neo deployment names).
// Locally, run both tags: `hardhat deploy --tags ArbitrationNeo,DisputeKitGatedPerCourtNeo` (files run in name order).
deployDisputeKitGatedPerCourtNeo.skip = async ({ network }) => {
  const chainId = network.config.chainId ?? 0;
  return isSkipped(network, chainId !== HomeChains.ARBITRUM_ONE && chainId !== HomeChains.HARDHAT);
};

export default deployDisputeKitGatedPerCourtNeo;
