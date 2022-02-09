import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const HOME_CHAIN_IDS = [42161, 421611, 31337]; // ArbOne, ArbRinkeby, Hardhat

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute } = deployments;
  const { AddressZero } = hre.ethers.constants;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  console.log("deployer: %s", deployer);

  const rng = await deploy("ConstantNG", {
    from: deployer,
    args: [42],
    log: true,
  });

  const disputeKit = await deploy("DisputeKitClassic", {
    from: deployer,
    args: [deployer, AddressZero, rng.address],
    log: true,
  });

  const sortitionSumTreeLibrary = await deploy("SortitionSumTreeFactory", {
    from: deployer,
    log: true,
  });

  // TODO: deploy a PNK token if there isn't one already

  const klerosCore = await deploy("KlerosCore", {
    from: deployer,
    libraries: {
      SortitionSumTreeFactory: sortitionSumTreeLibrary.address,
    },
    args: [deployer, AddressZero, AddressZero, disputeKit.address, false, 200, 10000, 100, 3, [0, 0, 0, 0], 3],
    log: true,
  });

  await execute("DisputeKitClassic", { from: deployer, log: true }, "changeCore", klerosCore.address);
};

deployArbitration.tags = ["HomeChain", "Arbitration"];
deployArbitration.skip = async ({ getChainId }) => !HOME_CHAIN_IDS.includes(Number(await getChainId()));

export default deployArbitration;
