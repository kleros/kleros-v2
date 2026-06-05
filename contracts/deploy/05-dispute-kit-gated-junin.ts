import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { HomeChains, isSkipped } from "./utils";
import { KlerosCore } from "../typechain-types";
import { getContractsFromNetwork } from "../scripts/utils/contracts";
import { deploySBT } from "./utils/deployTokens";

const config = {
  arbitrumSepoliaDevnet: {
    consumerProtectionCourtID: 4,
    disputeKitGatedID: 3,
    courtUrl: "https://dev--kleros-v2-testnet.netlify.app/#/courts/4/purpose",
  },
  arbitrumSepolia: {
    consumerProtectionCourtID: 6,
    disputeKitGatedID: 3,
    courtUrl: "https://v2-testnet.kleros.builders/#/courts/6/purpose",
  },
  arbitrum: {
    consumerProtectionCourtID: 32,
    disputeKitGatedID: 3,
    courtUrl: "https://v2.kleros.builders/#/courts/32/purpose",
  },
};

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, getNamedAccounts, getChainId } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const { consumerProtectionCourtID, disputeKitGatedID, courtUrl } = config[hre.network.name as keyof typeof config];

  const core = await ethers.getContract<KlerosCore>("KlerosCore");

  await deploySBT(
    hre,
    deployer,
    "Kleros-Certified Consumer Protection Lawyer in Argentina",
    "SBTACPLawyer",
    "Abogado de Protección al Consumidor en Argentina, Certificado por Kleros",
    "ipfs://QmTwgaKoTPnywJ5To73ei9WVXeWG7rbdCVJM1BM7a2eDzD",
    courtUrl
  );

  // Check that the Gated Dispute Kit ID is correct
  const { disputeKitGated } = await getContractsFromNetwork(hre);
  if (!disputeKitGated) {
    throw new Error("DisputeKitGated not found in network contracts");
  }
  const actualDisputeKitGatedAddress = await core.disputeKits(disputeKitGatedID);
  if (actualDisputeKitGatedAddress !== disputeKitGated.target) {
    throw new Error("DisputeKitGated address mismatch");
  }

  console.log(`core.enableDisputeKits(${consumerProtectionCourtID}, ${[disputeKitGatedID]}, true)`);
  await core.enableDisputeKits(consumerProtectionCourtID, [disputeKitGatedID], true);
};

deployArbitration.tags = ["Junin"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
