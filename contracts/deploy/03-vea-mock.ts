import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getContractAddress from "./utils/getContractAddress";
import { KlerosCore__factory } from "../typechain-types";
import disputeTemplate from "../test/fixtures/DisputeTemplate.simple.json";
import { HardhatChain, isSkipped } from "./utils";

// TODO: use deterministic deployments

const deployHomeGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts } = hre;
  const { deploy, execute } = deployments;
  const { hexZeroPad, hexlify } = ethers.utils;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  console.log("Deploying to chainId %s with deployer %s", HardhatChain.HARDHAT, deployer);

  const klerosCore = await deployments.get("KlerosCore");

  const vea = await deploy("VeaMock", {
    from: deployer,
    log: true,
  });

  const nonce = await ethers.provider.getTransactionCount(deployer);
  const homeGatewayAddress = getContractAddress(deployer, nonce + 1);
  console.log("Calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);

  const homeChainIdAsBytes32 = hexZeroPad(hexlify(HardhatChain.HARDHAT), 32);
  const foreignGateway = await deploy("ForeignGatewayOnEthereum", {
    from: deployer,
    contract: "ForeignGateway",
    args: [deployer, vea.address, homeChainIdAsBytes32, homeGatewayAddress],
    gasLimit: 4000000,
    log: true,
  }); // nonce+0

  await deploy("HomeGatewayToEthereum", {
    from: deployer,
    contract: "HomeGateway",
    args: [
      deployer,
      klerosCore.address,
      vea.address,
      HardhatChain.HARDHAT,
      foreignGateway.address,
      ethers.constants.AddressZero, // feeToken
    ],
    gasLimit: 4000000,
    log: true,
  }); // nonce+1

  // TODO: disable the gateway until fully initialized with the correct fees OR allow disputeCreators to add funds again if necessary.
  const signer = (await hre.ethers.getSigners())[0];
  const core = await KlerosCore__factory.connect(klerosCore.address, signer);
  // TODO: set up the correct fees for the FORKING_COURT
  const courtId = await core.GENERAL_COURT();
  const fee = (await core.courts(courtId)).feeForJuror;
  await execute("ForeignGatewayOnEthereum", { from: deployer, log: true }, "changeCourtJurorFee", courtId, fee);
  // TODO: set up the correct fees for the lower courts

  const disputeTemplateRegistry = await deploy("DisputeTemplateRegistry", {
    from: deployer,
    args: [],
    log: true,
  });

  // TODO: debug why this extraData fails but "0x00" works
  // const extraData =
  //   "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003"; // General court, 3 jurors
  const extraData = "0x00";
  await deploy("ArbitrableExample", {
    from: deployer,
    args: [
      foreignGateway.address,
      disputeTemplate,
      "disputeTemplateMapping: TODO",
      extraData,
      disputeTemplateRegistry.address,
      ethers.constants.AddressZero,
    ],
    log: true,
  });
};

deployHomeGateway.tags = ["VeaMock"];
deployHomeGateway.skip = async ({ network }) => {
  return isSkipped(network, HardhatChain[network.config.chainId ?? 0] === undefined);
};

export default deployHomeGateway;
