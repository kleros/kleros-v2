import { ethers } from "hardhat";
import hre = require("hardhat");
import {
  KlerosCore,
  ForeignGateway__factory,
  HomeGateway,
  TestERC20,
  IArbitrableV2__factory,
} from "../typechain-types";
import { DisputeRequestEventObject } from "../typechain-types/src/arbitration/interfaces/IArbitrableV2";
import { HttpNetworkConfig } from "hardhat/types";
import { DeploymentsExtension } from "hardhat-deploy/types";

export default async function main(
  foreignNetwork: HttpNetworkConfig,
  foreignDeployments: DeploymentsExtension,
  foreignGatewayArtifact: string,
  homeGatewayArtifact: string,
  feeTokenArtifact?: string
) {
  const core = (await ethers.getContract("KlerosCore")) as KlerosCore;
  const homeGateway = (await ethers.getContract(homeGatewayArtifact)) as HomeGateway;
  const feeToken = feeTokenArtifact ? ((await ethers.getContract(feeTokenArtifact)) as TestERC20) : undefined;

  const foreignChainProvider = new ethers.providers.JsonRpcProvider(foreignNetwork.url);
  const foreignGatewayDeployment = await foreignDeployments.get(foreignGatewayArtifact);
  const foreignGateway = await ForeignGateway__factory.connect(foreignGatewayDeployment.address, foreignChainProvider);
  const foreignChainId = await foreignChainProvider.getNetwork().then((network) => network.chainId);
  const arbitrableInterface = IArbitrableV2__factory.createInterface();

  // Event subscription
  // WARNING: The callback might run more than once if the script is restarted in the same block
  // type Listener = [ eventArg1, ...eventArgN, transactionReceipt ]
  foreignGateway.on(
    "CrossChainDisputeOutgoing",
    async (foreignBlockHash, foreignArbitrable, foreignDisputeID, choices, extraData, txReceipt) => {
      console.log(
        "CrossChainDisputeOutgoing: %s %s %s %s %s",
        foreignBlockHash,
        foreignArbitrable,
        foreignDisputeID,
        choices,
        extraData
      );
      // console.log("tx receipt: %O", txReceipt);

      // txReceipt is missing the full logs for this tx so we need to request it here
      const fullTxReceipt = await foreignChainProvider.getTransactionReceipt(txReceipt.transactionHash);

      // Retrieve the DisputeRequest event
      const disputeRequest = fullTxReceipt.logs
        .filter((log) => log.topics[0] === arbitrableInterface.getEventTopic("DisputeRequest"))
        .map((log) => arbitrableInterface.parseLog(log).args as unknown as DisputeRequestEventObject)[0];
      console.log("tx events DisputeRequest: %O", disputeRequest);
      // TODO: log a warning if there are multiple DisputeRequest events

      const relayCreateDisputeParams = {
        foreignBlockHash: foreignBlockHash,
        foreignChainID: foreignChainId,
        foreignArbitrable: foreignArbitrable,
        foreignDisputeID: foreignDisputeID,
        externalDisputeID: disputeRequest._externalDisputeID,
        templateId: disputeRequest._templateId,
        templateUri: disputeRequest._templateUri,
        choices: choices,
        extraData: extraData,
      };
      console.log("Relaying dispute to home chain... %O", relayCreateDisputeParams);

      let tx;
      if (feeToken === undefined) {
        // Paying in native Arbitrum ETH
        const cost = (await core.functions["arbitrationCost(bytes)"](extraData)).cost;
        tx = await homeGateway.functions[
          "relayCreateDispute((bytes32,uint256,address,uint256,uint256,uint256,string,uint256,bytes))"
        ](relayCreateDisputeParams, { value: cost });
      } else {
        // Paying in ERC20
        const cost = (await core.functions["arbitrationCost(bytes,address)"](extraData, feeToken.address)).cost;
        await (await feeToken.approve(homeGateway.address, cost)).wait();
        tx = await homeGateway.functions[
          "relayCreateDispute((bytes32,uint256,address,uint256,uint256,uint256,string,uint256,bytes),uint256)"
        ](relayCreateDisputeParams, cost);
      }
      tx = tx.wait();
      console.log("relayCreateDispute txId: %O", tx.transactionHash);
    }
  );

  console.log("Listening for events...");
  const delay = (ms) => new Promise((x) => setTimeout(x, ms));
  await delay(24 * 60 * 60 * 1000); // 24 hours
}