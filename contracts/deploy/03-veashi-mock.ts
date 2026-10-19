import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { KlerosCore__factory } from "../typechain-types";
import { Courts, ETH, HardhatChain, isSkipped } from "./utils";
import { deployUpgradable } from "./utils/deployUpgradable";

// Both Veashi gateways on the local network, standing for two chains that share chain ID 31337: an SDK Yaho and a
// YaruMock per leg and one SDK Hashi. Each oracle has a ReporterMock on each leg, which stores the message hashes
// into the AdapterMock of the other leg. A message reaches the other leg once its Yaru executes it, as a relayer
// would (test/utils/veashi.ts). KlerosCore is the HomeGateway's arbitrator, a GatewayLightbulb the foreign arbitrable.

const VEASHI_ORACLES = 2;
const VEASHI_THRESHOLD = 2; // The default selection is every oracle.

const deployVeashiMock: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts } = hre;
  const { deploy, execute } = deployments;
  const { ZeroAddress } = ethers;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = HardhatChain.HARDHAT;
  console.log("deploying to chainId %s with deployer %s", chainId, deployer);

  const klerosCore = await deployments.get("KlerosCore");

  const hashi = await deploy("Hashi", { from: deployer, log: true });
  const foreignYaho = await deploy("ForeignYaho", { contract: "Yaho", from: deployer, log: true }); // Dispute leg.
  const homeYaho = await deploy("HomeYaho", { contract: "Yaho", from: deployer, log: true }); // Ruling leg.
  // Each chain's Yaru executes the messages of the other chain's Yaho.
  const homeYaru = await deploy("HomeYaru", {
    contract: "YaruMock",
    from: deployer,
    args: [hashi.address, foreignYaho.address, chainId],
    log: true,
  });
  const foreignYaru = await deploy("ForeignYaru", {
    contract: "YaruMock",
    from: deployer,
    args: [hashi.address, homeYaho.address, chainId],
    log: true,
  });

  const foreignOracles = [];
  const homeOracles = [];
  for (let i = 0; i < VEASHI_ORACLES; i++) {
    const foreignReporter = await deploy(`ForeignReporter${i}`, {
      contract: "ReporterMock",
      from: deployer,
      args: [foreignYaho.address],
      log: true,
    });
    const homeAdapter = await deploy(`HomeAdapter${i}`, {
      contract: "AdapterMock",
      from: deployer,
      args: [foreignReporter.address],
      log: true,
    });
    const homeReporter = await deploy(`HomeReporter${i}`, {
      contract: "ReporterMock",
      from: deployer,
      args: [homeYaho.address],
      log: true,
    });
    const foreignAdapter = await deploy(`ForeignAdapter${i}`, {
      contract: "AdapterMock",
      from: deployer,
      args: [homeReporter.address],
      log: true,
    });
    foreignOracles.push({
      outboundReporter: foreignReporter.address,
      outboundAdapter: homeAdapter.address,
      inboundAdapter: foreignAdapter.address,
      enabled: true,
    });
    homeOracles.push({
      outboundReporter: homeReporter.address,
      outboundAdapter: foreignAdapter.address,
      inboundAdapter: homeAdapter.address,
    });
  }

  const homeGateway = await deployUpgradable(deployments, "VeashiHomeGateway", {
    contract: "HomeGateway",
    proxyAlias: "UUPSProxy",
    from: deployer,
    args: [
      deployer, // governor
      klerosCore.address,
      chainId,
      ZeroAddress, // foreign gateway, set below once deployed
      homeYaho.address,
      homeYaru.address,
      homeOracles,
    ],
    log: true,
  });

  const foreignGateway = await deployUpgradable(deployments, "VeashiForeignGateway", {
    contract: "ForeignGateway",
    proxyAlias: "UUPSProxy",
    from: deployer,
    args: [
      deployer, // governor
      deployer, // keeper
      chainId,
      homeGateway.address,
      foreignYaho.address,
      foreignYaru.address,
      ETH(1), // homeNativeRate: both legs use ETH
      foreignOracles,
      [...Array(VEASHI_ORACLES).keys()],
      VEASHI_THRESHOLD,
    ],
    log: true,
  });

  await execute("VeashiHomeGateway", { from: deployer, log: true }, "changeForeignGateway", foreignGateway.address);
  for (let i = 0; i < VEASHI_ORACLES; i++) {
    await execute(`ForeignReporter${i}`, { from: deployer, log: true }, "setDispatcher", foreignGateway.address);
    await execute(`HomeReporter${i}`, { from: deployer, log: true }, "setDispatcher", homeGateway.address);
  }

  // Mirror the General Court fee, without which the ForeignGateway rejects General Court disputes.
  const signer = await ethers.getSigner(deployer);
  const core = KlerosCore__factory.connect(klerosCore.address, signer);
  const fee = (await core.courts(Courts.GENERAL)).feeForJuror;
  await execute("VeashiForeignGateway", { from: deployer, log: true }, "changeCourtJurorFee", Courts.GENERAL, fee);

  // The HomeGateway pays KlerosCore's arbitration cost of every incoming dispute from its balance.
  await signer.sendTransaction({ to: homeGateway.address, value: ETH(10) }).then((tx) => tx.wait());

  await deploy("VeashiGatewayLightbulb", {
    contract: "GatewayLightbulb",
    from: deployer,
    args: [
      foreignGateway.address,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256"], [Courts.GENERAL, 3, 1]), // court, jurors, DisputeKitClassic
      0, // templateId
      "", // templateUri
    ],
    log: true,
  });
};

deployVeashiMock.tags = ["VeashiMock"];
deployVeashiMock.dependencies = ["Arbitration"];
deployVeashiMock.skip = async ({ network }) => {
  return isSkipped(network, HardhatChain[network.config.chainId ?? 0] === undefined);
};

export default deployVeashiMock;
