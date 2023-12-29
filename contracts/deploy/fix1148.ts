import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { DisputeKitClassic, KlerosCore, SortitionModule } from "../typechain-types";
import assert from "node:assert";
import { HomeChains, isSkipped } from "./utils";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const { AddressZero } = ethers.constants;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const klerosCore = (await ethers.getContract("KlerosCore")) as KlerosCore;
  const oldDisputeKit = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;

  await deploy("DisputeKitClassic", {
    from: deployer,
    args: [deployer, AddressZero],
    log: true,
  });

  const newDisputeKit = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;

  await execute("DisputeKitClassic", { from: deployer, log: true }, "changeCore", klerosCore.address);
  await execute("KlerosCore", { from: deployer, log: true }, "addNewDisputeKit", newDisputeKit.address, 0);

  const oldDisputeKitId = 1;
  const newDisputeKitId = 2;

  assert(
    await klerosCore.disputeKits(oldDisputeKitId).then((dk) => dk === oldDisputeKit.address),
    `wrong dispute kit id ${oldDisputeKitId}`
  );
  assert(
    await klerosCore.disputeKits(newDisputeKitId).then((dk) => dk === newDisputeKit.address),
    `wrong dispute kit id ${newDisputeKitId}`
  );

  await execute("KlerosCore", { from: deployer, log: true }, "enableDisputeKits", 1, [newDisputeKitId], true); // enable the new dispute kit in court 1
  await execute("KlerosCore", { from: deployer, log: true }, "enableDisputeKits", 2, [newDisputeKitId], true); // enable the new dispute kit in court 2
  await execute("KlerosCore", { from: deployer, log: true }, "enableDisputeKits", 3, [newDisputeKitId], true); // enable the new dispute kit in court 3

  // Cannot disable the old DK because of https://github.com/kleros/kleros-v2/blob/d9adb8f54e8164eb01880296b4dd62b74cad3a0e/contracts/src/arbitration/KlerosCore.sol#L452
  // Does not seem correct
  // await execute("KlerosCore", { from: deployer, log: true }, "enableDisputeKits", 1, [oldDisputeKitId], false); // disable the old dispute kit
};

deployArbitration.tags = ["Fix1148"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
