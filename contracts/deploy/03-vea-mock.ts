import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import getContractAddress from "../deploy-helpers/getContractAddress";

const HARDHAT_NETWORK = 31337;

// TODO: use deterministic deployments

const deployHomeGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { hexZeroPad, hexlify } = ethers.utils;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  console.log("deploying to chainId %s with deployer %s", HARDHAT_NETWORK, deployer);

  const klerosCore = await deployments.get("KlerosCore");

  const vea = await deploy("VeaMock", {
    from: deployer,
    log: true,
  });

  const nonce = await ethers.provider.getTransactionCount(deployer);
  const homeGatewayAddress = getContractAddress(deployer, nonce + 1);
  console.log("calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);

  const homeChainIdAsBytes32 = hexZeroPad(hexlify(HARDHAT_NETWORK), 32);
  const foreignGateway = await deploy("ForeignGatewayOnEthereum", {
    from: deployer,
    contract: "ForeignGateway",
    args: [deployer, vea.address, [ethers.BigNumber.from(10).pow(17)], homeGatewayAddress, homeChainIdAsBytes32],
    gasLimit: 4000000,
    log: true,
  }); // nonce+0

  await deploy("HomeGatewayToEthereum", {
    from: deployer,
    contract: "HomeGateway",
    args: [deployer, klerosCore.address, vea.address, foreignGateway.address, HARDHAT_NETWORK],
    gasLimit: 4000000,
    log: true,
  }); // nonce+1

  const metaEvidenceUri = `https://raw.githubusercontent.com/kleros/kleros-v2/master/contracts/deployments/goerli/MetaEvidence_ArbitrableExample.json`;

  await deploy("ArbitrableExample", {
    from: deployer,
    args: [foreignGateway.address, metaEvidenceUri],
    log: true,
  });
};

deployHomeGateway.tags = ["HomeChain", "VeaMock"];
deployHomeGateway.skip = async ({ getChainId }) => HARDHAT_NETWORK !== Number(await getChainId());

export default deployHomeGateway;
