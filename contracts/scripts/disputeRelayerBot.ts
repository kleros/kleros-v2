import { ethers } from "hardhat";
import hre = require("hardhat");
import { KlerosCore, PolicyRegistry, ForeignGateway__factory, HomeGateway, TestERC20 } from "../typechain-types";

async function main() {
  const core = (await ethers.getContract("KlerosCore")) as KlerosCore;
  const policyRegistry = (await ethers.getContract("PolicyRegistry")) as PolicyRegistry;
  const homeGateway = (await ethers.getContract("HomeGatewayToGnosis")) as HomeGateway;
  const dai = (await ethers.getContract("DAI")) as TestERC20;

  const foreignChainProvider = new ethers.providers.JsonRpcProvider(hre.config.networks.chiado.url);
  const foreignGatewayDeployment = await hre.companionNetworks.foreignChiado.deployments.get("ForeignGatewayOnGnosis");
  const foreignGateway = await ForeignGateway__factory.connect(foreignGatewayDeployment.address, foreignChainProvider);

  foreignGateway.on(
    "CrossChainDisputeOutgoing",
    async (foreignBlockHash, foreignArbitrable, foreignDisputeID, choices, extraData) => {
      console.log(
        "CrossChainDisputeOutgoing: %s %s %s %s %s",
        foreignBlockHash,
        foreignArbitrable,
        foreignDisputeID,
        choices,
        extraData
      );

      const cost = (await core.functions["arbitrationCost(bytes,address)"](extraData, dai.address)).cost;

      await dai.approve(homeGateway.address, cost);

      await homeGateway.functions[
        "relayCreateDispute((bytes32,uint256,address,uint256,uint256,uint256,string,uint256,bytes),uint256)"
      ](
        {
          foreignBlockHash: foreignBlockHash,
          foreignChainID: 10200,
          foreignArbitrable: foreignArbitrable,
          foreignDisputeID: foreignDisputeID,
          externalDisputeID: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("future of france")), // FIXME
          templateId: 1, // FIXME
          templateUri: "", // FIXME
          choices: choices,
          extraData: extraData,
        },
        cost
      );
    }
  );

  // type Listener = [ eventArg1, ...eventArgN, transactionReceipt ]

  // policyRegistry.on("PolicyUpdate", (courtId, courtName, policy, receipt) => {
  //   console.log("PolicyUpdate: %d %s %s %O", courtId, courtName, policy, receipt);
  //   // WARNING: This callback might run more than once if the script is restarted in the same block
  // });

  // core.on("DisputeCreation", (disputeID, arbitrable) => {
  //   console.log("DisputeCreation: %d %s %s %d %s %s", disputeID, arbitrable);
  //   // WARNING: This callback might run more than once if the script is restarted in the same block

  //   // if phase is staking and minStakingTime has passed, then passPhase()
  // });

  console.log("Listening for events...");
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(1000000);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
