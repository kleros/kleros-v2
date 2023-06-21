import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber } from "ethers";
import { DeployFunction, DeployResult } from "hardhat-deploy/types";
import { SortitionModule, VRFSubscriptionManagerV2Mock, VRFSubscriptionManagerV2 } from "../typechain-types";
import { HomeChains, isSkipped } from "./utils";
import { deployUpgradable } from "./utils/deployUpgradable";

const pnkByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x330bD769382cFc6d50175903434CCC8D206DCAE5"],
  [HomeChains.ARBITRUM_GOERLI, "0x3483FA1b87792cd5BE4100822C4eCEC8D3E531ee"],
]);

// https://randomizer.ai/docs#addresses
const randomizerByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF"],
  [HomeChains.ARBITRUM_GOERLI, "0x923096Da90a3b60eb7E12723fA2E1547BA9236Bc"],
]);

// https://docs.chain.link/resources/link-token-contracts?parent=vrf#arbitrum
const linkByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4"],
  [HomeChains.ARBITRUM_GOERLI, "0xd14838A68E8AFBAdE5efb411d5871ea0011AFd28"],
]);

// https://docs.chain.link/vrf/v2/subscription/supported-networks#arbitrum-mainnet
const keyHashByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x72d2b016bb5b62912afea355ebf33b91319f828738b111b723b78696b9847b63"], // 30 gwei key Hash
  [HomeChains.ARBITRUM_GOERLI, "0x83d1b6e3388bed3d76426974512bb0d270e9542a765cd667242ea26c0cc0b730"],
  [HomeChains.HARDHAT, "0x0000000000000000000000000000000000000000000000000000000000000000"],
]);

// https://docs.chain.link/vrf/v2/subscription/supported-networks#arbitrum-mainnet
const vrfCoordinatorByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x41034678D6C633D8a95c75e1138A360a28bA15d1"],
  [HomeChains.ARBITRUM_GOERLI, "0x6D80646bEAdd07cE68cab36c27c626790bBcf17f"],
]);

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const { AddressZero } = hre.ethers.constants;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to %s with deployer %s", HomeChains[chainId], deployer);

  if (chainId === HomeChains.HARDHAT) {
    pnkByChain.set(
      HomeChains.HARDHAT,
      (
        await deploy("PNK", {
          from: deployer,
          log: true,
        })
      ).address
    );
    randomizerByChain.set(
      HomeChains.HARDHAT,
      (
        await deploy("RandomizerMock", {
          from: deployer,
          args: [],
          log: true,
        })
      ).address
    );
    vrfCoordinatorByChain.set(
      HomeChains.HARDHAT,
      (
        await deploy("VRFCoordinatorV2Mock", {
          from: deployer,
          args: [BigNumber.from(10).pow(18), 1000000000], // base_fee: 1 LINK, gas_price_link: 0.000000001 LINK per gas, from chainlink mock scripts
          log: true,
        })
      ).address
    );
  }

  const randomizer = randomizerByChain.get(Number(await getChainId())) ?? AddressZero;
  await deployUpgradable(deployments, "RandomizerRNG", { from: deployer, args: [randomizer, deployer], log: true });
  const rng = await deploy("BlockHashRNG", {
    from: deployer,
    args: [],
    log: true,
  });

  const sortitionModule = (await hre.ethers.getContract("SortitionModule")) as SortitionModule;
  await sortitionModule.changeRandomNumberGenerator(rng.address, RNG_LOOKAHEAD);

  const link = linkByChain.get(Number(await getChainId())) ?? AddressZero; // LINK not needed on hardhat local node
  const keyHash = keyHashByChain.get(Number(await getChainId())) ?? AddressZero;
  const requestConfirmations = 3; // Paramater to be fixed, range [1 ; 200] on Arbitrum
  const callbackGasLimit = 100000; // Parameter to be fixed, 50000 on RandomizerRNG but no external call to sortitionModule.passPhase() in the callback
  const numWords = 1;
  const vrfCoordinator = vrfCoordinatorByChain.get(Number(await getChainId())) ?? AddressZero;
  // Deploy the VRF Subscription Manager contract on Arbitrum, a mock contract on Hardhat node or nothing on other networks.
  let vrfSubscriptionManager: DeployResult | string;
  if (vrfCoordinator) {
    vrfSubscriptionManager =
      chainId === HomeChains.HARDHAT
        ? await deploy("VRFSubscriptionManagerV2Mock", {
            from: deployer,
            args: [deployer, vrfCoordinator],
            log: true,
          })
        : await deploy("VRFSubscriptionManagerV2", {
            from: deployer,
            args: [deployer, vrfCoordinator, link],
            log: true,
          });
  } else {
    vrfSubscriptionManager = AddressZero;
  }

  // Execute the setup transactions for using VRF and deploy the Consumer contract on Hardhat node
  // The Sortition Module rng source is not changed to the VRF Consumer.
  if (vrfSubscriptionManager) {
    if (chainId === HomeChains.HARDHAT) {
      const vrfSubscriptionManagerContract = (await hre.ethers.getContract(
        "VRFSubscriptionManagerV2Mock"
      )) as VRFSubscriptionManagerV2Mock;
      await vrfSubscriptionManagerContract.topUpSubscription(BigNumber.from(10).pow(20)); // 100 LINK
      const subscriptionId = await vrfSubscriptionManagerContract.subscriptionId();
      const vrfConsumer = await deploy("VRFConsumerV2", {
        from: deployer,
        args: [
          deployer,
          vrfCoordinator,
          sortitionModule.address,
          keyHash,
          subscriptionId,
          requestConfirmations,
          callbackGasLimit,
          numWords,
        ],
        log: true,
      });
      await vrfSubscriptionManagerContract.addConsumer(vrfConsumer.address);
    }
  } else {
    const vrfSubscriptionManagerContract = (await hre.ethers.getContract(
      "VRFSubscriptionManagerV2"
    )) as VRFSubscriptionManagerV2;
    const subscriptionId = await vrfSubscriptionManagerContract.subscriptionId();
    const vrfConsumer = await deploy("VRFConsumerV2", {
      from: deployer,
      args: [
        deployer,
        vrfCoordinator,
        sortitionModule.address,
        keyHash,
        subscriptionId,
        requestConfirmations,
        callbackGasLimit,
        numWords,
      ],
      log: true,
    });
    await vrfSubscriptionManagerContract.addConsumer(vrfConsumer.address);
  }
};

deployArbitration.tags = ["RNG"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
