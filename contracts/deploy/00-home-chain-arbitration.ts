import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";
import getContractAddress from "../deploy-helpers/getContractAddress";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}

const pnkByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x330bD769382cFc6d50175903434CCC8D206DCAE5"],
  [HomeChains.ARBITRUM_RINKEBY, "0x364530164a2338cdba211f72c1438eb811b5c639"],
  [HomeChains.ARBITRUM_GOERLI, "0x4DEeeFD054434bf6721eF39Aa18EfB3fd0D12610"],
]);

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy, execute } = deployments;
  const { AddressZero } = hre.ethers.constants;
  const { providers } = ethers;

  const homeNetworks = {
    42161: config.networks.arbitrum,
    421611: config.networks.arbitrumRinkeby,
    31337: config.networks.localhost,
  };

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  await deploy("PolicyRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  const rng = await deploy("BlockHashRNG", {
    from: deployer,
    args: [],
    log: true,
  });

  const disputeKit = await deploy("DisputeKitClassic", {
    from: deployer,
    args: [deployer, AddressZero],
    log: true,
  });

  let nonce;
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
    nonce = await ethers.provider.getTransactionCount(deployer);
    nonce += 1;
  } else {
    const homeChainProvider = new providers.JsonRpcProvider(homeNetworks[chainId].url);
    nonce = await homeChainProvider.getTransactionCount(deployer);
    // TODO: Nonce hasn't been determined for this part of the condition.
    nonce += 1;
  }

  const KlerosCoreAddress = getContractAddress(deployer, nonce);
  console.log("calculated future KlerosCore address for nonce %d: %s", nonce, KlerosCoreAddress);

  const sortitionModule = await deploy("SortitionModule", {
    from: deployer,
    args: [KlerosCoreAddress, 1800, 1800, rng.address], // minStakingTime, maxFreezingTime
    log: true,
  });

  const pnk = pnkByChain.get(Number(await getChainId())) ?? AddressZero;
  const minStake = BigNumber.from(10).pow(20).mul(2);
  const alpha = 10000;
  const feeForJuror = BigNumber.from(10).pow(17);
  const klerosCore = await deploy("KlerosCore", {
    from: deployer,
    args: [
      deployer,
      pnk,
      AddressZero,
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, 3], // minStake, alpha, feeForJuror, jurorsForCourtJump
      [0, 0, 0, 0], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      0xfa, // Extra data for sortition module will return the default value of K
      sortitionModule.address,
    ],
    log: true,
  });

  // execute DisputeKitClassic.changeCore() only if necessary
  const currentCore = await hre.ethers.getContractAt("DisputeKitClassic", disputeKit.address).then((dk) => dk.core());
  if (currentCore !== klerosCore.address) {
    await execute("DisputeKitClassic", { from: deployer, log: true }, "changeCore", klerosCore.address);
  }

  await deploy("DisputeResolver", {
    from: deployer,
    args: [klerosCore.address],
    log: true,
  });
};

deployArbitration.tags = ["HomeChain", "Arbitration"];
deployArbitration.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !HomeChains[chainId];
};

export default deployArbitration;
