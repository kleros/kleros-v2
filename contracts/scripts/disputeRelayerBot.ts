import env from "./utils/env";
import loggerFactory from "./utils/logger";
import hre from "hardhat";
import { JsonRpcProvider, Log } from "ethers";
import {
  KlerosCore,
  ForeignGateway__factory,
  HomeGateway,
  TestERC20,
  IArbitrableV2__factory,
} from "../typechain-types";
import type { DisputeRequestEvent } from "../typechain-types/src/arbitration/interfaces/IArbitrableV2";
import type { IHomeGateway } from "../typechain-types/src/gateway/HomeGateway";
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

const safeJson = (value: unknown) =>
  JSON.stringify(value, (_, nestedValue) =>
    typeof nestedValue === "bigint" ? nestedValue.toString() : nestedValue,
  );

export default async function main(
  foreignNetwork: HttpNetworkConfig,
  foreignDeployments: DeploymentsExtension,
  foreignGatewayArtifact: string,
  homeGatewayArtifact: string,
  feeTokenArtifact?: string,
) {
  const core = await ethers.getContract<KlerosCore>("KlerosCore");
  const homeGateway =
    await ethers.getContract<HomeGateway>(homeGatewayArtifact);
  const feeToken = feeTokenArtifact
    ? await ethers.getContract<TestERC20>(feeTokenArtifact)
    : undefined;

  const foreignChainProvider = new JsonRpcProvider(foreignNetwork.url);
  const foreignGatewayDeployment = await foreignDeployments.get(
    foreignGatewayArtifact,
  );
  const foreignGateway = await ForeignGateway__factory.connect(
    foreignGatewayDeployment.address,
    foreignChainProvider,
  );
  const foreignChainID = (await foreignChainProvider.getNetwork()).chainId;
  const arbitrableInterface = IArbitrableV2__factory.createInterface();
  const disputeRequestTopic =
    arbitrableInterface.getEvent("DisputeRequest").topicHash;

  const logger = loggerFactory
    .createLogger(loggerOptions)
    .child({ foreignChainId: foreignChainID });
  logger.info(`Listening for events from ${foreignGatewayArtifact}...`);

  if (HEARTBEAT_URL) {
    logger.debug("Sending heartbeat");
    fetch(HEARTBEAT_URL);
  } else {
    logger.debug("Heartbeat not set up, skipping");
  }

  // Event subscription
  // WARNING: The callback might run more than once if the script is restarted in the same block
  // type Listener = [ eventArg1, ...eventArgN, eventLog ]
  foreignGateway.on(
    foreignGateway.filters.CrossChainDisputeOutgoing(),
    async (
      foreignBlockHash,
      foreignArbitrable,
      foreignDisputeID,
      choices,
      extraData,
      eventLog,
    ) => {
      logger.info(
        `CrossChainDisputeOutgoing: ${foreignBlockHash} ${foreignArbitrable} ${foreignDisputeID} ${choices} ${extraData}`,
      );
      logger.debug(`tx receipt: ${safeJson(eventLog)}`);

      // txReceipt is missing the full logs for this tx so we need to request it here
      const fullTxReceipt = await foreignChainProvider.getTransactionReceipt(
        eventLog.transactionHash,
      );
      if (!fullTxReceipt) {
        throw new Error(
          `No transaction receipt for ${eventLog.transactionHash}`,
        );
      }

      // Retrieve the DisputeRequest event
      const disputeRequests: DisputeRequestEvent.OutputObject[] =
        fullTxReceipt.logs
          .filter((log: Log) => log.topics[0] === disputeRequestTopic)
          .map((log: Log) => {
            const parsed = arbitrableInterface.parseLog(log);
            if (!parsed) {
              throw new Error(
                `Failed to parse DisputeRequest log: ${log.transactionHash}`,
              );
            }
            return parsed.args as unknown as DisputeRequestEvent.OutputObject;
          });
      logger.warn(
        `More than 1 DisputeRequest event: not supported yet, skipping the others events.`,
      );

      const disputeRequest = disputeRequests[0];
      logger.info(`tx events DisputeRequest: ${safeJson(disputeRequest)}`);

      const relayCreateDisputeParams: IHomeGateway.RelayCreateDisputeParamsStruct =
        {
          foreignBlockHash,
          foreignChainID,
          foreignArbitrable,
          foreignDisputeID,
          templateId: disputeRequest._templateId,
          choices,
          extraData,
        };
      logger.info(
        `Relaying dispute to home chain... ${safeJson(relayCreateDisputeParams)}`,
      );

      let tx;
      if (feeToken === undefined) {
        // Paying in native Arbitrum ETH
        const cost = await core["arbitrationCost(bytes)"](extraData);
        tx = await homeGateway[
          "relayCreateDispute((bytes32,uint256,address,uint256,uint256,uint256,bytes))"
        ](relayCreateDisputeParams, { value: cost });
      } else {
        // Paying in ERC20
        const cost = await core["arbitrationCost(bytes,address)"](
          extraData,
          feeToken.target,
        );
        await (await feeToken.approve(homeGateway.target, cost)).wait();
        tx = await homeGateway[
          "relayCreateDispute((bytes32,uint256,address,uint256,uint256,uint256,bytes),uint256)"
        ](relayCreateDisputeParams, cost);
      }
      tx = await tx.wait();
      logger.info(`relayCreateDispute txId: ${tx?.hash}`);
    },
  );

  const delay = (ms: number) => new Promise((x) => setTimeout(x, ms));
  await delay(60 * 60 * 1000); // 1 hour
}
