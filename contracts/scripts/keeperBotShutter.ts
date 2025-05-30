import hre from "hardhat";
import { getBytes } from "ethers";
import { DisputeKitShutter, SortitionModule, SortitionModuleNeo } from "../typechain-types";
import { decrypt } from "./shutter";
import env from "./utils/env";
import loggerFactory from "./utils/logger";
import { Cores, getContracts as getContractsForCoreType } from "./utils/contracts";

const SUBGRAPH_URL = env.require("SUBGRAPH_URL");
const CORE_TYPE = env.optional("CORE_TYPE", "base");

const loggerOptions = env.optionalNoDefault("LOGTAIL_TOKEN_KEEPER_BOT")
  ? {
      transportTargetOptions: {
        target: "@logtail/pino",
        options: { sourceToken: env.require("LOGTAIL_TOKEN_KEEPER_BOT") },
        level: env.optional("LOG_LEVEL", "info"),
      },
      level: env.optional("LOG_LEVEL", "info"), // for pino-pretty
    }
  : {
      level: env.optional("LOG_LEVEL", "info"),
    };
const logger = loggerFactory.createLogger(loggerOptions);

const getContracts = async () => {
  const coreType = Cores[CORE_TYPE.toUpperCase() as keyof typeof Cores];
  if (coreType === Cores.UNIVERSITY) {
    throw new Error("University is not supported yet");
  }
  const contracts = await getContractsForCoreType(hre, coreType);
  return { ...contracts, sortition: contracts.sortition as SortitionModule | SortitionModuleNeo };
};

/**
 * Decodes a message string into its component parts
 * @param message The message to decode
 * @returns Object containing the decoded components
 */
const decode = (message: string) => {
  const SEPARATOR = "-";
  const [choice, salt, justification] = message.split(SEPARATOR);
  return {
    choice: BigInt(choice),
    salt,
    justification,
  };
};

/**
 * Parses a Graph vote ID string (e.g., "2-45-1-0") into its components.
 * @param graphVoteId - The vote ID string from the Graph.
 * @returns An object with disputeKitID, localDisputeID, localRoundID, and voteID as numbers.
 */
const parseGraphVoteId = (graphVoteId: string) => {
  const [disputeKitID, localDisputeID, localRoundID, voteID] = graphVoteId.split("-").map(Number);
  return { disputeKitID, localDisputeID, localRoundID, voteID };
};

type DisputeVotes = {
  votes: {
    id: string;
    commit: string;
    commited: boolean;
    voted: boolean;
    juror: {
      id: string;
    };
  }[];
  coreDispute: {
    id: string;
    currentRoundIndex: string;
  };
};

const getShutterDisputesToReveal = async (disputeKitShutter: DisputeKitShutter): Promise<DisputeVotes[]> => {
  const { gql, request } = await import("graphql-request"); // workaround for ESM import
  const query = gql`
    query DisputeToAutoReveal($shutterDisputeKit: Bytes) {
      disputeKits(where: { address: $shutterDisputeKit, courts_: { hiddenVotes: true } }) {
        id
        rounds(where: { isCurrentRound: true, dispute_: { period: vote } }) {
          id
          dispute {
            disputeID
            currentRoundIndex
            currentRound {
              id
            }
            disputeKitDispute {
              localRounds {
                ... on ClassicRound {
                  votes {
                    id
                    ... on ClassicVote {
                      commit
                      commited
                      voted
                      juror {
                        id
                      }
                    }
                  }
                }
              }
              id
              currentLocalRoundIndex
              coreDispute {
                id
                currentRoundIndex
              }
            }
            period
          }
        }
      }
    }
  `;
  type ShutterDisputes = {
    disputeKits: Array<{
      id: string;
      rounds: Array<{
        id: string;
        dispute: {
          disputeID: string;
          currentRoundIndex: string;
          currentRound: {
            id: string;
          };
          disputeKitDispute: Array<{
            localRounds: Array<{
              votes: Array<{
                id: string;
                commit: string;
                commited: boolean;
                voted: boolean;
                juror: {
                  id: string;
                };
              }>;
            }>;
            id: string;
            currentLocalRoundIndex: string;
            coreDispute: {
              id: string;
              currentRoundIndex: string;
            };
          }>;
          period: string;
        };
      }>;
    }>;
  };

  logger.debug(`Using Shutter dispute kit: ${disputeKitShutter.target}`);
  const variables = { shutterDisputeKit: disputeKitShutter.target };
  const { disputeKits } = await request<ShutterDisputes>(SUBGRAPH_URL, query, variables);
  if (disputeKits.length === 0) {
    logger.debug("No Shutter dispute kit found, skipping auto-reveal");
    return [];
  }
  // For each round, if dispute.disputeKitDispute.length !== 1, filter out the round
  let filteredRounds = disputeKits[0].rounds.filter((round) => round.dispute.disputeKitDispute.length === 1);

  // Remove the rounds which are not the current ones
  filteredRounds = filteredRounds.filter((round) => round.id === round.dispute.currentRound.id);

  // For each filteredRound, in dispute.disputeKitDispute[0], keep only localRounds[currentLocalRoundIndex]
  const disputeVotes = filteredRounds.map((round) => {
    const dk = round.dispute.disputeKitDispute[0];
    const idx = Number(dk.currentLocalRoundIndex);
    const filteredLocalRounds = dk.localRounds.filter((_, i) => i === idx);
    return {
      coreDispute: dk.coreDispute,
      votes: filteredLocalRounds[0].votes,
    };
  });

  // Filter out the disputes without votes and the votes where committed is false or voted is true
  const filteredDisputeVotes = disputeVotes
    .map((item) => ({
      ...item,
      votes: item.votes.filter((vote) => vote.commited && !vote.voted),
    }))
    .filter((item) => item.votes.length > 0);

  return filteredDisputeVotes;
};

export const shutterAutoReveal = async (disputeKitShutter: DisputeKitShutter | null, disputesToSkip: string[]) => {
  if (!disputeKitShutter) {
    logger.debug("No Shutter dispute kit found, skipping auto-reveal");
    return [];
  }

  logger.info(`Using Shutter API: ${process.env.SHUTTER_API ?? "mainnet"}`);

  const shutterDisputes = await getShutterDisputesToReveal(disputeKitShutter);
  logger.info(`Votes to auto-reveal: ${JSON.stringify(shutterDisputes, null, 2)}`);

  for (const dispute of shutterDisputes) {
    const { coreDispute, votes } = dispute;
    if (disputesToSkip.includes(coreDispute.id)) {
      logger.info(`Skipping disputeID: ${coreDispute.id}`);
      continue;
    }
    const decryptCache = new Map<string, string>(); // Cache for decrypted messages: key is `${_encryptedVote}-${_identity}`
    const decryptedToVoteIDs = new Map<string, number[]>(); // Map from decryptedMessage string to array of voteIDs
    const decryptedToSample = new Map<string, { _encryptedVote: any; _identity: any }>(); // Map from decryptedMessage string to a sample { _encryptedVote, _identity } (for logging/debug)

    // For each vote, decrypt the message and group voteIDs by decryptedMessage
    for (const vote of votes) {
      const { voteID } = parseGraphVoteId(vote.id);

      // Retrieve the CommitCastShutter events
      const filter = disputeKitShutter.filters.CommitCastShutter(coreDispute.id, vote.juror.id, getBytes(vote.commit));
      const events = await disputeKitShutter.queryFilter(filter);
      if (events.length === 0) {
        logger.error(`No CommitCastShutter event found for disputeID: ${coreDispute.id}, voteID: ${vote.id}`);
        continue;
      }
      if (events.length > 1) {
        logger.warn(
          `Multiple CommitCastShutter events found for disputeID: ${coreDispute.id}, voteID: ${vote.id}, using the first one only`
        );
      }
      const { _encryptedVote, _identity } = events[0].args;
      logger.debug(`CommitCastShutter event: ${JSON.stringify({ _encryptedVote, _identity }, null, 2)}`);

      // Decrypt the message
      const cacheKey = `${_encryptedVote.toString()}-${_identity.toString()}`;
      let decryptedMessage: string;
      if (decryptCache.has(cacheKey)) {
        logger.debug(`Using cached value for ${cacheKey}`);
        decryptedMessage = decryptCache.get(cacheKey)!;
      } else {
        try {
          logger.debug(`Decrypting message for ${cacheKey}`);
          decryptedMessage = await decrypt(_encryptedVote, _identity);
          decryptCache.set(cacheKey, decryptedMessage);
        } catch (e) {
          logger.error(`Error decrypting message for ${cacheKey}: ${e}`);
          continue;
        }
      }
      logger.debug(`Decrypted message: ${decryptedMessage}`);

      // Group voteIDs by decryptedMessage
      if (!decryptedToVoteIDs.has(decryptedMessage)) {
        decryptedToVoteIDs.set(decryptedMessage, []);
        decryptedToSample.set(decryptedMessage, { _encryptedVote, _identity });
      }
      decryptedToVoteIDs.get(decryptedMessage)!.push(voteID);
    }

    // For each unique decryptedMessage, decode and castVote once with all voteIDs
    for (const [decryptedMessage, voteIDs] of decryptedToVoteIDs.entries()) {
      const decodedMessage = decode(decryptedMessage);
      logger.info(
        `Decoded message for voteIDs [${voteIDs.join(", ")}]: ${JSON.stringify({ choice: decodedMessage.choice.toString(), salt: decodedMessage.salt, justification: decodedMessage.justification }, null, 2)}`
      );
      // Simulate
      try {
        await disputeKitShutter.castVoteShutter.staticCall(
          coreDispute.id,
          voteIDs,
          decodedMessage.choice,
          decodedMessage.salt,
          decodedMessage.justification
        );
      } catch (e) {
        logger.error(
          `CastVoteShutter: will fail for disputeID: ${coreDispute.id} and voteIDs [${voteIDs.join(", ")}], skipping`
        );
        continue;
      }
      // Execute with extra gas
      try {
        const gas =
          ((await disputeKitShutter.castVoteShutter.estimateGas(
            coreDispute.id,
            voteIDs,
            decodedMessage.choice,
            decodedMessage.salt,
            decodedMessage.justification
          )) *
            150n) /
          100n; // 50% extra gas
        const tx = await disputeKitShutter.castVoteShutter(
          coreDispute.id,
          voteIDs,
          decodedMessage.choice,
          decodedMessage.salt,
          decodedMessage.justification,
          { gasLimit: gas }
        );
        logger.info(`Cast vote transaction: ${tx.hash}`);
      } catch (e) {
        logger.error(e, "Failure");
        continue;
      }
    }
  }
};

async function main() {
  logger.debug("Starting...");
  const { disputeKitShutter } = await getContracts();
  await shutterAutoReveal(disputeKitShutter, ["44", "45", "51", "54"]);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => {
      logger.flush();
    });
}
