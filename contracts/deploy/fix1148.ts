import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { DisputeKitClassic, KlerosCore } from "../typechain-types";
import assert from "node:assert";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const { AddressZero } = hre.ethers.constants;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const oldDisputeKitId = 1;
  const newDisputeKitId = 2;

  const klerosCore = (await hre.ethers.getContract("KlerosCore")) as KlerosCore;
  const oldDisputeKit = (await hre.ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;

  await deploy("DisputeKitClassic", {
    from: deployer,
    args: [deployer, AddressZero],
    log: true,
  });

  const newDisputeKit = (await hre.ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;

  await execute("KlerosCore", { from: deployer, log: true }, "addNewDisputeKit", newDisputeKit.address, 0);

  assert(
    await klerosCore.disputeKitNodes(oldDisputeKitId).then((node) => node.disputeKit === oldDisputeKit.address),
    `wrong dispute kit id ${oldDisputeKitId}`
  );
  assert(
    await klerosCore.disputeKitNodes(newDisputeKitId).then((node) => node.disputeKit === newDisputeKit.address),
    `wrong dispute kit id ${newDisputeKitId}`
  );

  await execute("KlerosCore", { from: deployer, log: true }, "enableDisputeKits", 1, newDisputeKitId, true); // enable the new dispute kit
  await execute("KlerosCore", { from: deployer, log: true }, "enableDisputeKits", 1, oldDisputeKitId, false); // disable the old dispute kit
};

deployArbitration.tags = ["Fix1148"];
deployArbitration.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !HomeChains[chainId];
};

export default deployArbitration;
