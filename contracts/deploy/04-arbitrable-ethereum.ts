import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

enum ForeignChains {
  ETHEREUM_MAINNET = 1,
  ETHEREUM_GOERLI = 5,
}

const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy, execute } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to chainId %s with deployer %s", chainId, deployer);

  const foreignGateway = await deployments.get("ForeignGatewayOnEthereum");
  const metaEvidenceUri = `https://raw.githubusercontent.com/kleros/kleros-v2/master/contracts/deployments/${hre.network.name}/MetaEvidence_ArbitrableExample.json`;
  const weth = await deployments.get("WETH");
  await deploy("ArbitrableExample", {
    from: deployer,
    args: [foreignGateway.address, 0, metaEvidenceUri, weth.address],
    log: true,
  });
};

deployForeignGateway.tags = ["ArbitrableOnEthereum"];
deployForeignGateway.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployForeignGateway;
