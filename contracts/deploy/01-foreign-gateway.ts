import { parseEther } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getContractAddress from "../deploy-helpers/getContractAddress";

enum ForeignChains {
  ETHEREUM_MAINNET = 1,
  ETHEREUM_GOERLI = 5,
}

const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy } = deployments;
  const { hexZeroPad, hexlify } = ethers.utils;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to chainId %s with deployer %s", chainId, deployer);

  const homeNetworks = {
    1: config.networks.arbitrum,
    5: config.networks.arbitrumGoerli,
  };

  // Hack to predict the deployment address on the home chain.
  // TODO: use deterministic deployments
  const homeChainProvider = new ethers.providers.JsonRpcProvider(homeNetworks[chainId].url);
  let nonce = await homeChainProvider.getTransactionCount(deployer);
  nonce += 2; // HomeGatewayToEthereum deploy tx will the third tx after this on its home network, so we add two to the current nonce.
  const homeChainId = (await homeChainProvider.getNetwork()).chainId;
  const homeChainIdAsBytes32 = hexZeroPad(hexlify(homeChainId), 32);
  const homeGatewayAddress = getContractAddress(deployer, nonce);
  console.log("calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);

  const veaReceiver = await deployments.get("FastBridgeReceiverOnEthereum");

  const foreignGateway = await deploy("ForeignGatewayOnEthereum", {
    from: deployer,
    contract: "ForeignGateway",
    args: [
      deployer,
      veaReceiver.address,
      [ethers.BigNumber.from(10).pow(17)],
      homeGatewayAddress,
      homeChainIdAsBytes32,
    ],
    gasLimit: 4000000,
    log: true,
  });

  const metaEvidenceUri = `https://raw.githubusercontent.com/kleros/kleros-v2/master/contracts/deployments/${hre.network.name}/MetaEvidence_ArbitrableExample.json`;

  await deploy("ArbitrableExample", {
    from: deployer,
    args: [foreignGateway.address, metaEvidenceUri],
    log: true,
  });
};

deployForeignGateway.tags = ["ForeignChain", "ForeignGateway"];
deployForeignGateway.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployForeignGateway;
