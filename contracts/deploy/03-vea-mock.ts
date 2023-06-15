import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getContractAddress from "../deploy-helpers/getContractAddress";

const HARDHAT_NETWORK = 31337;

// TODO: use deterministic deployments

const deployHomeGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts } = hre;
  const { deploy, execute } = deployments;
  const { hexZeroPad, hexlify } = ethers.utils;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  console.log("Deploying to chainId %s with deployer %s", HARDHAT_NETWORK, deployer);

  const klerosCore = await deployments.get("KlerosCore");

  const vea = await deploy("VeaMock", {
    from: deployer,
    log: true,
  });

  const nonce = await ethers.provider.getTransactionCount(deployer);
  const homeGatewayAddress = getContractAddress(deployer, nonce + 1);
  console.log("Calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);

  const homeChainIdAsBytes32 = hexZeroPad(hexlify(HARDHAT_NETWORK), 32);
  const foreignGateway = await deploy("ForeignGatewayOnEthereum", {
    from: deployer,
    contract: "ForeignGateway",
    args: [deployer, vea.address, homeChainIdAsBytes32, homeGatewayAddress],
    gasLimit: 4000000,
    log: true,
  }); // nonce+0

  await deploy("HomeGatewayToEthereum", {
    from: deployer,
    contract: "HomeGateway",
    args: [deployer, klerosCore.address, vea.address, HARDHAT_NETWORK, foreignGateway.address],
    gasLimit: 4000000,
    log: true,
  }); // nonce+1

  await execute(
    "ForeignGatewayOnEthereum",
    { from: deployer, log: true },
    "changeCourtJurorFee",
    0,
    ethers.BigNumber.from(10).pow(17)
  );

  const metaEvidenceUri = `https://raw.githubusercontent.com/kleros/kleros-v2/master/contracts/deployments/goerli/MetaEvidence_ArbitrableExample.json`;

  await deploy("ArbitrableExample", {
    from: deployer,
    args: [foreignGateway.address, 0, metaEvidenceUri, ethers.constants.AddressZero],
    log: true,
  });
};

deployHomeGateway.tags = ["VeaMock"];
deployHomeGateway.skip = async ({ getChainId }) => HARDHAT_NETWORK !== Number(await getChainId());

export default deployHomeGateway;
