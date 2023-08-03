import env from "./utils/env";
import loggerFactory from "./utils/logger";
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

const { ethers } = hre;
const HEARTBEAT_URL = env.optionalNoDefault("HEARTBEAT_URL_RELAYER_BOT");

const loggerOptions = env.optionalNoDefault("LOGTAIL_TOKEN_RELAYER_BOT")
  ? {
      transportTargetOptions: {
        target: "@logtail/pino",
        options: { sourceToken: env.require("LOGTAIL_TOKEN_RELAYER_BOT") },
        level: env.optional("LOG_LEVEL", "info"),
      },
      level: env.optional("LOG_LEVEL", "info"), // for pino-pretty
    }
  : {};

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
  const foreignChainID = await foreignChainProvider.getNetwork().then((network) => network.chainId);
  const arbitrableInterface = IArbitrableV2__factory.createInterface();

  const logger = loggerFactory.createLogger(loggerOptions).child({ foreignChainId: foreignChainID });
  logger.info(`Listening for events from ${foreignGatewayArtifact}...`);

  if (HEARTBEAT_URL) {
    logger.debug("Sending heartbeat");
    fetch(HEARTBEAT_URL);
  } else {
    logger.debug("Heartbeat not set up, skipping");
  }

  // Event subscription
  // WARNING: The callback might run more than once if the script is restarted in the same block
  // type Listener = [ eventArg1, ...eventArgN, transactionReceipt ]
  foreignGateway.on(
    "CrossChainDisputeOutgoing",
    async (foreignBlockHash, foreignArbitrable, foreignDisputeID, choices, extraData, txReceipt) => {
      logger.info(
        `CrossChainDisputeOutgoing: ${foreignBlockHash} ${foreignArbitrable} ${foreignDisputeID} ${choices} ${extraData}`
      );
      logger.debug(`tx receipt: ${JSON.stringify(txReceipt)}`);

      // txReceipt is missing the full logs for this tx so we need to request it here
      const fullTxReceipt = await foreignChainProvider.getTransactionReceipt(txReceipt.transactionHash);

      // Retrieve the DisputeRequest event
      const disputeRequests: DisputeRequestEventObject[] = fullTxReceipt.logs
        .filter((log) => log.topics[0] === arbitrableInterface.getEventTopic("DisputeRequest"))
        .map((log) => arbitrableInterface.parseLog(log).args as unknown as DisputeRequestEventObject);
      logger.warn(`More than 1 DisputeRequest event: not supported yet, skipping the others events.`);

      const disputeRequest = disputeRequests[0];
      logger.info(`tx events DisputeRequest: ${JSON.stringify(disputeRequest)}`);

      const relayCreateDisputeParams = {
        foreignBlockHash,
        foreignChainID,
        foreignArbitrable,
        foreignDisputeID,
        externalDisputeID: disputeRequest._externalDisputeID,
        templateId: disputeRequest._templateId,
        templateUri: disputeRequest._templateUri,
        choices,
        extraData,
      };
      logger.info(`Relaying dispute to home chain... ${JSON.stringify(relayCreateDisputeParams)}`);

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
      logger.info(`relayCreateDispute txId: ${tx.transactionHash}`);
    }
  );

  const delay = (ms) => new Promise((x) => setTimeout(x, ms));
  await delay(60 * 60 * 1000); // 1 hour
}
