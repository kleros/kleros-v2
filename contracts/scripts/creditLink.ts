import { deployments, getNamedAccounts, getChainId, ethers } from "hardhat";
import { LinkTokenInterface, VRFSubscriptionManagerV2 } from "../typechain-types";
import { task, types } from "hardhat/config";
import { BigNumber } from "ethers";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_GOERLI = 421613,
}

// https://docs.chain.link/resources/link-token-contracts?parent=vrf#arbitrum
const linkByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4"],
  [HomeChains.ARBITRUM_GOERLI, "0xd14838A68E8AFBAdE5efb411d5871ea0011AFd28"],
]);

const ONE_LINK_WEI = BigNumber.from(10).pow(18);

task("credit-link", "Credit LINK tokens to the current Chainlink VRF Subscription")
  .addParam("amount", "(in normal values, not wei!) The amount of LINK tokens to credit")
  .setAction(async (taskArgs, hre) => {
    const { deployments, getNamedAccounts, getChainId, ethers } = hre;
    const { AddressZero } = ethers.constants;
    const deployer = (await getNamedAccounts()).deployer ?? AddressZero;

    const chainId = Number(await getChainId());
    if (!HomeChains[chainId]) {
      console.error(`Aborting: script is not compatible with ${chainId}`);
      return;
    } else {
      console.log("Crediting %d LINK to %s with deployer %s", HomeChains[chainId], deployer);
    }

    const { amount } = taskArgs;
    const amountInWei = BigNumber.from(amount).mul(ONE_LINK_WEI);

    // Retrieve LINK token contract from artifact to interact with it
    const linkTokenAddress = linkByChain.get(Number(await getChainId())) ?? AddressZero;
    const linkTokenArtifact = await hre.artifacts.readArtifact("LinkTokenInterface");
    const linkToken = (await ethers.getContractAtFromArtifact(
      linkTokenArtifact,
      linkTokenAddress
    )) as LinkTokenInterface;

    const vrfSubscriptionManagerDeployment = await deployments.get("VRFSubscriptionManagerV2");
    const vrfSubscriptionManager = (await ethers.getContractAt(
      "VRFSubscriptionManagerV2",
      vrfSubscriptionManagerDeployment.address
    )) as VRFSubscriptionManagerV2;

    // Transfer LINK from deployer to the Subscription Manager
    await linkToken.transfer(vrfSubscriptionManager.address, amountInWei);

    // // Fund the subscription, sending `amount` LINK tokens
    await vrfSubscriptionManager.topUpSubscription(amountInWei);
  });
