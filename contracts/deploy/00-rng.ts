import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { SortitionModule, RandomizerRNG } from "../typechain-types";
import { HomeChains, isSkipped } from "./utils";
import { deployUpgradable } from "./utils/deployUpgradable";

const pnkByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x330bD769382cFc6d50175903434CCC8D206DCAE5"],
  [HomeChains.ARBITRUM_GOERLI, "0x3483FA1b87792cd5BE4100822C4eCEC8D3E531ee"],
]);

const randomizerByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF"],
  [HomeChains.ARBITRUM_GOERLI, "0x923096Da90a3b60eb7E12723fA2E1547BA9236Bc"],
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
  }

  const randomizer = randomizerByChain.get(Number(await getChainId())) ?? AddressZero;
  await deployUpgradable(hre, "RandomizerRNG", { from: deployer, args: [randomizer, deployer], log: true });
  const rng = await deploy("BlockHashRNG", {
    from: deployer,
    args: [],
    log: true,
  });

  const sortitionModule = (await hre.ethers.getContract("SortitionModule")) as SortitionModule;
  await sortitionModule.changeRandomNumberGenerator(rng.address, RNG_LOOKAHEAD);
};

deployArbitration.tags = ["RNG"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
