import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped } from "./utils";
import { KlerosCore, TestERC20 } from "../typechain-types";
import { deploySBT } from "./utils/deployTokens";

const config = {
  arbitrumSepoliaDevnet: {
    consumerProtectionCourtID: 4,
    courtUrl: "https://dev--kleros-v2-testnet.netlify.app/#/courts/4/purpose",
  },
  arbitrumSepolia: {
    consumerProtectionCourtID: 6,
    courtUrl: "https://v2-testnet.kleros.builders/#/courts/6/purpose",
  },
  arbitrum: {
    consumerProtectionCourtID: 32,
    courtUrl: "https://v2.kleros.builders/#/courts/32/purpose",
  },
};

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const { consumerProtectionCourtID, courtUrl } = config[hre.network.name as keyof typeof config];

  const weth = await ethers.getContract<TestERC20>("WETH");
  const core = await ethers.getContract<KlerosCore>("KlerosCore");

  const practitionerToken = await deploySBT(
    hre,
    deployer,
    "Kleros-Certified Conflict Resolution Practitioner in Argentina",
    "SBTACPExperience",
    "Practicante de Resolución de Conflictos en Argentina, Certificado por Kleros",
    "ipfs://QmdZYU6TWTxx22zLKRRfBJqNAWxC2XT6VXkTpHh71CnpZn",
    courtUrl
  );

  const lawyerToken = await deploySBT(
    hre,
    deployer,
    "Kleros-Certified Consumer Protection Lawyer in Argentina",
    "SBTACPLawyer",
    "Abogado de Protección al Consumidor en Argentina, Certificado por Kleros",
    "ipfs://QmTwgaKoTPnywJ5To73ei9WVXeWG7rbdCVJM1BM7a2eDzD",
    courtUrl
  );

  const disputeKit = await deployUpgradable(deployments, "DisputeKitGatedArgentinaConsumerProtection", {
    from: deployer,
    args: [deployer, core.target, weth.target, practitionerToken.target, lawyerToken.target],
    log: true,
  });
  await core.addNewDisputeKit(disputeKit.address);
  const disputeKitID = (await core.getDisputeKitsLength()) - 1n;

  // console.log(`core.enableDisputeKits(${consumerProtectionCourtID}, ${[disputeKitID]}, true)`);
  // await core.enableDisputeKits(consumerProtectionCourtID, [disputeKitID], true);
};

deployArbitration.tags = ["ArgentinaConsumerProtectionDK"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
