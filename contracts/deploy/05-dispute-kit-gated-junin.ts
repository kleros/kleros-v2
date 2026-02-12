import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { HomeChains, isSkipped } from "./utils";
import { getContractOrDeploy } from "./utils/getContractOrDeploy";
import { Contract } from "ethers";
import { KlerosCore } from "../typechain-types";
import { getContractsFromNetwork } from "../scripts/utils/contracts";

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

  await deploySBT(
    hre,
    deployer,
    "Kleros-Certified Consumer Protection Lawyer in Argentina",
    "SBTACPLawyer",
    "Abogado de Protección al Consumidor en Argentina, Certificado por Kleros",
    "ipfs://QmTwgaKoTPnywJ5To73ei9WVXeWG7rbdCVJM1BM7a2eDzD",
    courtUrl
  );

  const core = await ethers.getContract<KlerosCore>("KlerosCore");

  // Check that the Gated Dispute Kit ID is correct
  const { disputeKitGated } = await getContractsFromNetwork(hre);
  const actualDisputeKitGatedAddress = await core.disputeKits(disputeKitGatedID);
  if (actualDisputeKitGatedAddress !== disputeKitGated?.target) {
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
