import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped, Courts } from "./utils";
import { getContractOrDeploy } from "./utils/getContractOrDeploy";
import { Contract } from "ethers";
import { KlerosCore, TestERC20 } from "../typechain-types";

const deploySBT = async (
  hre: HardhatRuntimeEnvironment,
  deployer: string,
  name: string,
  ticker: string,
  description: string,
  imageUri: string,
  externalUrl: string
): Promise<Contract> => {
  return getContractOrDeploy(hre, ticker, {
    from: deployer,
    contract: "SBT",
    args: [name, ticker, description, imageUri, externalUrl],
    log: true,
  });
};

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const courtUrl = "https://v2.kleros.builders/#/courts/29/purpose"; // TODO: get the correct courtID

  const weth = await ethers.getContract<TestERC20>("WETH");
  const core = await ethers.getContract<KlerosCore>("KlerosCore");

  // const practitionerToken = await deploySBT(
  //   hre,
  //   deployer,
  //   "Kleros-Certified Conflict Resolution Practitioner in Argentina",
  //   "SBTACPExperience",
  //   "Practicante de Resolución de Conflictos en Argentina, Certificado por Kleros",
  //   "ipfs://QmdZYU6TWTxx22zLKRRfBJqNAWxC2XT6VXkTpHh71CnpZn",
  //   courtUrl,
  // );

  // return;

  const lawyerToken = await deploySBT(
    hre,
    deployer,
    "Kleros-Certified Consumer Protection Lawyer in Argentina",
    "SBTACPLawyer",
    "Abogado de Protección al Consumidor en Argentina, Certificado por Kleros",
    "ipfs://QmTwgaKoTPnywJ5To73ei9WVXeWG7rbdCVJM1BM7a2eDzD",
    courtUrl
  );

  return;

  const disputeKit = await deployUpgradable(deployments, "DisputeKitGatedArgentinaConsumerProtection", {
    from: deployer,
    args: [deployer, core.target, weth.target, practitionerToken.address, lawyerToken.address],
    log: true,
  });
  await core.addNewDisputeKit(disputeKit.address);
  const disputeKitID = (await core.getDisputeKitsLength()) - 1n;
  await core.enableDisputeKits(Courts.GENERAL, [disputeKitID], true);
};

deployArbitration.tags = ["ArgentinaConsumerProtectionDK"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
