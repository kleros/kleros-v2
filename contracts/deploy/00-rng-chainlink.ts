import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { HomeChains, isSkipped } from "./utils";
import { getContractOrDeploy } from "./utils/getContractOrDeploy";
import { RNGWithFallback } from "../typechain-types";

const deployRng: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, getChainId, ethers } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId()) as unknown as HomeChains; // Checked at runtime by skip()
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const KEY_HASHES = {
    // https://docs.chain.link/vrf/v2-5/supported-networks#arbitrum-mainnet
    [HomeChains.ARBITRUM_ONE]: {
      2: "0x9e9e46732b32662b9adc6f3abdf6c5e926a666d174a4d6b8e39c4cca76a38897",
      30: "0x8472ba59cf7134dfe321f4d61a430c4857e8b19cdd5230b09952a92671c24409",
      150: "0xe9f223d7d83ec85c4f78042a4845af3a1c8df7757b4997b815ce4b8d07aca68c",
    },
    // https://docs.chain.link/vrf/v2-5/supported-networks#arbitrum-sepolia-testnet
    [HomeChains.ARBITRUM_SEPOLIA]: {
      150: "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be",
    },
    [HomeChains.HARDHAT]: {
      0: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
  };

  const SUBSCRIPTION_ID = {
    [HomeChains.ARBITRUM_ONE]: "66240499937595191069677958665918759554657443303079118766000192000140992834352",
    [HomeChains.ARBITRUM_SEPOLIA]: "38502597312983100069991953687934627561654236680431968938019951490339399569548",
    [HomeChains.HARDHAT]: "0x0000000000000000000000000000000000000000000000000000000000000001",
  };

  function getKeyHash({ gasPrice }: { gasPrice: keyof (typeof KEY_HASHES)[HomeChains.ARBITRUM_ONE] }): string {
    const validGasPrices = Object.keys(KEY_HASHES[HomeChains.ARBITRUM_ONE]).map(Number);
    if (!validGasPrices.includes(gasPrice)) {
      throw new Error(`Invalid gas price ${gasPrice}. Valid values are: ${validGasPrices.join(", ")}`);
    }
    if (chainId == HomeChains.HARDHAT) return KEY_HASHES[chainId][0];
    if (chainId == HomeChains.ARBITRUM_ONE) return KEY_HASHES[chainId][gasPrice];
    if (chainId == HomeChains.ARBITRUM_SEPOLIA) return KEY_HASHES[chainId][150];
    throw new Error(`Unknown chainId ${chainId}`);
  }

  const ChainlinkVRFCoordinator = await getContractOrDeploy(hre, "ChainlinkVRFCoordinator", {
    from: deployer,
    contract: "ChainlinkVRFCoordinatorV2Mock",
    args: [],
    log: true,
  });

  const keyHash = getKeyHash({ gasPrice: 30 });
  const subscriptionId = SUBSCRIPTION_ID[chainId];
  const requestConfirmations = 200; // between 1 and 200 L2 blocks
  const callbackGasLimit = 100000;

  const oldRng = await ethers.getContractOrNull("ChainlinkRNG");
  if (!oldRng) {
    console.log("Register this Chainlink consumer here: http://vrf.chain.link/");
  }

  const rng = await getContractOrDeploy(hre, "ChainlinkRNG", {
    from: deployer,
    args: [
      deployer,
      deployer, // The consumer is configured as the RNGWithFallback later
      ChainlinkVRFCoordinator.target,
      keyHash,
      subscriptionId,
      requestConfirmations,
      callbackGasLimit,
    ],
    log: true,
  });

  const fallbackTimeoutSeconds = 30 * 60; // 30 minutes
  await getContractOrDeploy(hre, "RNGWithFallback", {
    from: deployer,
    args: [
      deployer,
      deployer, // The consumer is configured as the SortitionModule later
      fallbackTimeoutSeconds,
      rng.target,
    ],
    log: true,
  });

  // rng.changeConsumer() only if necessary
  const rngWithFallback = await ethers.getContract<RNGWithFallback>("RNGWithFallback");
  const rngConsumer = await rng.consumer();
  if (rngConsumer !== rngWithFallback.target) {
    console.log(`rng.changeConsumer(${rngWithFallback.target})`);
    await rng.changeConsumer(rngWithFallback.target);
  }
};

deployRng.tags = ["ChainlinkRNG"];
deployRng.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployRng;
