import { parseUnits, parseEther } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

enum ForeignChains {
  GNOSIS_MAINNET = 100,
  GNOSIS_CHIADO = 10200,
  HARDHAT = 31337,
}

const wrappedPNKByChain = new Map<ForeignChains, string>([
  [ForeignChains.GNOSIS_MAINNET, "0xcb3231aBA3b451343e0Fddfc45883c842f223846"],
]);

const ONE_GWEI = parseUnits("1", "gwei");

const deployKlerosLiquid: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to chainId %s with deployer %s", chainId, deployer);

  if (!wrappedPNKByChain.get(chainId)) {
    const wPnk = await deploy("WrappedPinakion", {
      from: deployer,
      log: true,
      maxFeePerGas: ONE_GWEI,
      maxPriorityFeePerGas: ONE_GWEI,
    });

    wrappedPNKByChain.set(ForeignChains[ForeignChains[chainId]], wPnk.address);

    await deploy("WPNKFaucet", {
      from: deployer,
      contract: "Faucet",
      args: [wPnk.address],
      log: true,
      maxFeePerGas: ONE_GWEI,
      maxPriorityFeePerGas: ONE_GWEI,
    });
  }

  const wPnkAddress = wrappedPNKByChain.get(ForeignChains[ForeignChains[chainId]]);
  const rng = ethers.constants.AddressZero;
  const minStakingTime = 99999999;
  const maxFreezingTime = 0;
  const minStake = parseEther("9999999");
  const alpha = 10000;
  const feeForJuror = 0;
  const jurorsForCourtJump = 9999999;
  const sortitionSumTreeK = 3;
  const foreignGateway = await deployments.get("ForeignGatewayOnGnosis");
  const weth = await deployments.get("WETH");

  console.log(
    "Using: \nwPNK at %s, \nForeignGateway at %s, \nWETH at %s",
    wPnkAddress,
    foreignGateway.address,
    weth.address
  );

  const sortitionSumTreeLibrary = await deploy("SortitionSumTreeFactory", {
    from: deployer,
    log: true,
    maxFeePerGas: ONE_GWEI,
    maxPriorityFeePerGas: ONE_GWEI,
  });

  await deploy("xKlerosLiquidV2", {
    from: deployer,
    log: true,
    libraries: {
      SortitionSumTreeFactory: sortitionSumTreeLibrary.address,
    },
    maxFeePerGas: ONE_GWEI,
    maxPriorityFeePerGas: ONE_GWEI,
  });

  await execute(
    "xKlerosLiquidV2",
    {
      from: deployer,
      log: true,
      maxFeePerGas: ONE_GWEI,
      maxPriorityFeePerGas: ONE_GWEI,
    },
    "initialize",
    deployer,
    wPnkAddress,
    rng,
    minStakingTime,
    maxFreezingTime,
    false,
    [minStake, alpha, feeForJuror, jurorsForCourtJump], // minStake, alpha, feeForJuror, jurorsForCourtJump
    [0, 0, 0, 0], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
    sortitionSumTreeK,
    foreignGateway.address,
    weth.address
  );

  const metaEvidenceUri = "INIT ME";
  await deploy("ArbitrableExample", {
    from: deployer,
    args: [foreignGateway.address, metaEvidenceUri],
    log: true,
    maxFeePerGas: ONE_GWEI,
    maxPriorityFeePerGas: ONE_GWEI,
  });
};

// TODO: mock deployment on the hardhat network
// const xPinakionByChain = new Map<ForeignChains, string>([
//   [ForeignChains.GNOSIS_MAINNET, "0x37b60f4E9A31A64cCc0024dce7D0fD07eAA0F7B3"],
//   [ForeignChains.GNOSIS_CHIADO, "0x00"],
// ]);
// const tokenBridgeByChain = new Map<ForeignChains, string>([
//   [ForeignChains.GNOSIS_MAINNET, "0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d"],
//   [ForeignChains.GNOSIS_CHIADO, "0xbb3c86f9918C3C1d83668fA84e79E876d147fFf2"],
// ]);
// const hardhatDeployer = () => {
//   // TODO: deploy mocks for xPinakion and tokenBridge for Hardhat network
//   const wEth = await deployments.get("WETH");
//   const wEth = wethByChain[chainId];
//   // const xPnk = await deployments.get("WPNK");
//   const xPnk = xPinakionByChain[chainId];
//   const tokenBridge = tokenBridgeByChain[chainId];
//   const wPnk = await deploy("WrappedPinakion", {
//     from: deployer,
//     log: true,
//   });

//   await execute(
//     "WrappedPinakion",
//     { from: deployer, log: true },
//     "initialize",
//     "Staking PNK on xDai",
//     "stPNK",
//     xPnk,
//     tokenBridge
//   );
// };

deployKlerosLiquid.tags = ["KlerosLiquidOnGnosis"];
deployKlerosLiquid.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployKlerosLiquid;
