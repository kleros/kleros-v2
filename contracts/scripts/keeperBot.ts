import hre from "hardhat";
import { toBigInt, BigNumberish, getNumber, BytesLike } from "ethers";
import { SortitionModule, SortitionModuleNeo } from "../typechain-types";
import env from "./utils/env";
import loggerFactory from "./utils/logger";
import { Cores, getContracts as getContractsForCoreType } from "./utils/contracts";

let request: <T>(url: string, query: string) => Promise<T>; // Workaround graphql-request ESM import
const { ethers } = hre;
const MAX_DRAW_ITERATIONS = 30;
const MAX_EXECUTE_ITERATIONS = 20;
const MAX_DELAYED_STAKES_ITERATIONS = 50;
const WAIT_FOR_RNG_DURATION = 5 * 1000; // 5 seconds
const ITERATIONS_COOLDOWN_PERIOD = 10 * 1000; // 10 seconds
const HIGH_GAS_LIMIT = { gasLimit: 50_000_000 }; // 50M gas
const HEARTBEAT_URL = env.optionalNoDefault("HEARTBEAT_URL_KEEPER_BOT");
const SUBGRAPH_URL = env.require("SUBGRAPH_URL");
const MAX_JURORS_PER_DISPUTE = 1000; // Skip disputes with more than this number of jurors
const CORE_TYPE = env.optional("CORE_TYPE", "base");
const DISPUTES_TO_SKIP = env
  .optional("DISPUTES_TO_SKIP", "")
  .split(",")
  .map((s) => s.trim());

const loggerOptions = env.optionalNoDefault("LOGTAIL_TOKEN_KEEPER_BOT")
  ? {
      transportTargetOptions: {
        target: "@logtail/pino",
        options: { sourceToken: env.require("LOGTAIL_TOKEN_KEEPER_BOT") },
        level: env.optional("LOG_LEVEL", "info"),
      },
      level: env.optional("LOG_LEVEL", "info"), // for pino-pretty
    }
  : {};
const logger = loggerFactory.createLogger(loggerOptions);

const getContracts = async () => {
  const coreType = Cores[CORE_TYPE.toUpperCase() as keyof typeof Cores];
  if (coreType === Cores.UNIVERSITY) {
    throw new Error("University is not supported yet");
  }
  const contracts = await getContractsForCoreType(hre, coreType);
  return { ...contracts, sortition: contracts.sortition as SortitionModule | SortitionModuleNeo };
};

type Contribution = {
  contributor: {
    id: string;
  };
  choice: string;
  rewardWithdrawn: boolean;
  coreDispute: {
    currentRoundIndex: string;
  };
};

type Dispute = {
  period: string;
  id: string;
  currentRoundIndex: string;
};

type CustomError = {
  data: BytesLike;
  reason: string;
  code: string;
  errorArgs: any[];
  errorName: string;
  errorSignature: string;
};

enum Phase {
  STAKING = "staking",
  GENERATING = "generating",
  DRAWING = "drawing",
}
const PHASES = Object.values(Phase);

const getNonFinalDisputes = async (): Promise<Dispute[]> => {
  const nonFinalDisputesRequest = `{
    disputes(where: {period_not: execution}) {
      period
      id
      currentRoundIndex
    }
  }`;
  // TODO: use a local graph node if chainId is HARDHAT
  const result = await request(SUBGRAPH_URL, nonFinalDisputesRequest);
  const { disputes } = result as { disputes: Dispute[] };
  return disputes;
};

const getAppealContributions = async (disputeId: string): Promise<Contribution[]> => {
  const appealContributionsRequest = (disputeId: string) => `{
    contributions(where: {coreDispute: "${disputeId}"}) {
      contributor {
        id
      }
      ... on ClassicContribution {
        choice
        rewardWithdrawn
      }
      coreDispute {
        currentRoundIndex
      }
    }
  }`;
  // TODO: use a local graph node if chainId is HARDHAT
  const result = await request(SUBGRAPH_URL, appealContributionsRequest(disputeId));
  const { contributions } = result as { contributions: Contribution[] };
  return contributions;
};

const getDisputesWithUnexecutedRuling = async (): Promise<Dispute[]> => {
  const disputesWithUnexecutedRuling = `{
    disputes(where: {period: execution, ruled: false}) {
      id
      currentRoundIndex
    	period
    }
  }`;
  // TODO: use a local graph node if chainId is HARDHAT
  const result = (await request(SUBGRAPH_URL, disputesWithUnexecutedRuling)) as { disputes: Dispute[] };
  return result.disputes;
};

const getUniqueDisputes = (disputes: Dispute[]): Dispute[] => {
  return [...new Map(disputes.map((v) => [v.id, v])).values()];
};

const getDisputesWithContributionsNotYetWithdrawn = async (): Promise<Dispute[]> => {
  const disputesWithContributionsNotYetWithdrawn = `{
    classicContributions(where: {rewardWithdrawn: false}) {
      coreDispute {
        id
        period
        currentRoundIndex
      }
    }
  }`;
  // TODO: use a local graph node if chainId is HARDHAT
  const result = (await request(SUBGRAPH_URL, disputesWithContributionsNotYetWithdrawn)) as {
    classicContributions: { coreDispute: Dispute }[];
  };
  const disputes = result.classicContributions
    .filter((contribution) => contribution.coreDispute.period === "execution")
    .map((dispute) => dispute.coreDispute);
  return getUniqueDisputes(disputes);
};

const handleError = (e: any) => {
  logger.error(e, "Failure");
};

const isRngReady = async () => {
  const { chainlinkRng, randomizerRng, blockHashRNG, sortition } = await getContracts();
  const currentRng = await sortition.rng();
  if (currentRng === chainlinkRng?.target && chainlinkRng !== null) {
    const requestID = await chainlinkRng.lastRequestId();
    const n = await chainlinkRng.randomNumbers(requestID);
    if (Number(n) === 0) {
      logger.info("ChainlinkRNG is NOT ready yet");
      return false;
    } else {
      logger.info(`ChainlinkRNG is ready: ${n.toString()}`);
      return true;
    }
  } else if (currentRng === randomizerRng?.target && randomizerRng !== null) {
    const requestID = await randomizerRng.lastRequestId();
    const n = await randomizerRng.randomNumbers(requestID);
    if (Number(n) === 0) {
      logger.info("RandomizerRNG is NOT ready yet");
      return false;
    } else {
      logger.info(`RandomizerRNG is ready: ${n.toString()}`);
      return true;
    }
  } else if (currentRng === blockHashRNG?.target && blockHashRNG !== null) {
    const requestBlock = await sortition.randomNumberRequestBlock();
    const lookahead = await sortition.rngLookahead();
    const n = await blockHashRNG.receiveRandomness.staticCall(requestBlock + lookahead);
    if (Number(n) === 0) {
      logger.info("BlockHashRNG is NOT ready yet");
      return false;
    } else {
      logger.info(`BlockHashRNG is ready: ${n.toString()}`);
      return true;
    }
  } else {
    logger.error("Unknown RNG at ", currentRng);
    return false;
  }
};

const passPhase = async () => {
  const { sortition } = await getContracts();
  let success = false;
  try {
    await sortition.passPhase.staticCall();
  } catch (e) {
    const error = e as CustomError;
    const errorDescription = sortition.interface.parseError(error.data)?.signature;
    logger.info(`passPhase: not ready yet because of ${errorDescription}`);
    return success;
  }
  const before = getNumber(await sortition.phase());
  try {
    const gas = ((await sortition.passPhase.estimateGas()) * 150n) / 100n; // 50% extra gas
    const tx = await (await sortition.passPhase({ gasLimit: gas })).wait();
    logger.info(`passPhase txID: ${tx?.hash}`);
  } catch (e) {
    handleError(e);
  } finally {
    const after = getNumber(await sortition.phase());
    logger.info(`passPhase: ${PHASES[before]} -> ${PHASES[after]}`);
    success = before !== after; // true if successful
  }
  return success;
};

const passPeriod = async (dispute: { id: string }) => {
  const { core } = await getContracts();
  let success = false;
  try {
    await core.passPeriod.staticCall(dispute.id);
  } catch (e) {
    const error = e as CustomError;
    const errorDescription = core.interface.parseError(error.data)?.signature;
    logger.info(`passPeriod: not ready yet for dispute ${dispute.id} because of error ${errorDescription}`);
    return success;
  }
  const before = (await core.disputes(dispute.id)).period;
  try {
    const gas = ((await core.passPeriod.estimateGas(dispute.id)) * 150n) / 100n; // 50% extra gas
    const tx = await (await core.passPeriod(dispute.id, { gasLimit: gas })).wait();
    logger.info(`passPeriod txID: ${tx?.hash}`);
  } catch (e) {
    handleError(e);
  } finally {
    const after = (await core.disputes(dispute.id)).period;
    logger.info(`passPeriod for dispute ${dispute.id}: ${before} -> ${after}`);
    success = before !== after; // true if successful
  }
  return success;
};

const drawJurors = async (dispute: { id: string; currentRoundIndex: string }, iterations: number) => {
  const { core } = await getContracts();
  let success = false;
  try {
    await core.draw.staticCall(dispute.id, iterations, HIGH_GAS_LIMIT);
  } catch (e) {
    logger.error(`Draw: will fail for ${dispute.id}, skipping`);
    return success;
  }
  try {
    const tx = await (await core.draw(dispute.id, iterations, HIGH_GAS_LIMIT)).wait();
    logger.info(`Draw txID: ${tx?.hash}`);
    success = true;
  } catch (e) {
    handleError(e);
  } finally {
    const roundInfo = await core.getRoundInfo(dispute.id, dispute.currentRoundIndex);
    logger.info(`Drawn jurors (last 20): ${roundInfo.drawnJurors.slice(-20)}`);
  }
  return success;
};

const executeRepartitions = async (dispute: { id: string; currentRoundIndex: string }, iterations: number) => {
  const { core } = await getContracts();
  let success = false;
  try {
    await core.execute.staticCall(dispute.id, dispute.currentRoundIndex, iterations, HIGH_GAS_LIMIT);
  } catch (e) {
    logger.error(`Execute: will fail for ${dispute.id}, skipping`);
    return success;
  }
  try {
    const tx = await (await core.execute(dispute.id, dispute.currentRoundIndex, iterations, HIGH_GAS_LIMIT)).wait();
    logger.info(`Execute txID: ${tx?.hash}`);
    success = true;
  } catch (e) {
    handleError(e);
  }
  return success;
};

const executeRuling = async (dispute: { id: string }) => {
  const { core } = await getContracts();
  let success = false;
  try {
    await core.executeRuling.staticCall(dispute.id);
  } catch (e) {
    logger.error(`ExecuteRuling: will fail for ${dispute.id}, skipping`);
    return success;
  }
  try {
    const gas = ((await core.executeRuling.estimateGas(dispute.id)) * 150n) / 100n; // 50% extra gas
    const tx = await (await core.executeRuling(dispute.id, { gasLimit: gas })).wait();
    logger.info(`ExecuteRuling txID: ${tx?.hash}`);
    success = true;
  } catch (e) {
    handleError(e);
  }
  return success;
};

const withdrawAppealContribution = async (
  disputeId: string,
  roundId: string,
  contribution: Contribution
): Promise<boolean> => {
  const { disputeKitClassic: kit } = await getContracts();
  let success = false;
  let amountWithdrawn = 0n;
  try {
    amountWithdrawn = await kit.withdrawFeesAndRewards.staticCall(
      disputeId,
      contribution.contributor.id,
      roundId,
      contribution.choice
    );
  } catch (e) {
    logger.warn(
      `WithdrawFeesAndRewards: will fail for dispute #${disputeId}, round #${roundId}, choice ${contribution.choice} and beneficiary ${contribution.contributor.id}, skipping`
    );
    return success;
  }
  if (amountWithdrawn === 0n) {
    logger.debug(
      `WithdrawFeesAndRewards: no fees or rewards to withdraw for dispute #${disputeId}, round #${roundId}, choice ${contribution.choice} and beneficiary ${contribution.contributor.id}, skipping`
    );
    return success;
  }
  try {
    logger.info(
      `WithdrawFeesAndRewards: appeal contribution for dispute #${disputeId}, round #${roundId}, choice ${contribution.choice} and beneficiary ${contribution.contributor.id}`
    );
    const gas =
      ((await kit.withdrawFeesAndRewards.estimateGas(
        disputeId,
        contribution.contributor.id,
        roundId,
        contribution.choice
      )) *
        150n) /
      100n; // 50% extra gas
    const tx = await (
      await kit.withdrawFeesAndRewards(disputeId, contribution.contributor.id, roundId, contribution.choice, {
        gasLimit: gas,
      })
    ).wait();
    logger.info(`WithdrawFeesAndRewards txID: ${tx?.hash}`);
    success = true;
  } catch (e) {
    handleError(e);
  }
  return success;
};

const executeDelayedStakes = async () => {
  const { sortition } = await getContracts();

  // delayedStakes = 1 + delayedStakeWriteIndex - delayedStakeReadIndex
  const delayedStakesRemaining =
    1n + (await sortition.delayedStakeWriteIndex()) - (await sortition.delayedStakeReadIndex());

  const delayedStakes =
    delayedStakesRemaining < MAX_DELAYED_STAKES_ITERATIONS
      ? delayedStakesRemaining
      : toBigInt(MAX_DELAYED_STAKES_ITERATIONS);

  if (delayedStakes === 0n) {
    logger.info("No delayed stakes to execute");
    return true;
  }
  logger.info(`Executing ${delayedStakes} delayed stakes, ${delayedStakesRemaining} remaining`);
  let success = false;
  try {
    await sortition.executeDelayedStakes.staticCall(delayedStakes);
  } catch (e) {
    logger.error(`executeDelayedStakes: will fail because of ${JSON.stringify(e)}`);
    return success;
  }
  try {
    const gas = ((await sortition.executeDelayedStakes.estimateGas(delayedStakes)) * 150n) / 100n; // 50% extra gas
    const tx = await (await sortition.executeDelayedStakes(delayedStakes, { gasLimit: gas })).wait();
    logger.info(`executeDelayedStakes txID: ${tx?.hash}`);
  } catch (e) {
    handleError(e);
  }
  return success;
};

const getMissingJurors = async (dispute: { id: string; currentRoundIndex: string }) => {
  const { core } = await getContracts();
  const { nbVotes, drawnJurors } = await core.getRoundInfo(dispute.id, dispute.currentRoundIndex);
  return nbVotes - toBigInt(drawnJurors.length);
};

const isDisputeFullyDrawn = async (dispute: { id: string; currentRoundIndex: string }): Promise<boolean> => {
  return (await getMissingJurors(dispute)) === 0n;
};

const getNumberOfMissingRepartitions = async (
  dispute: { id: string; currentRoundIndex: string },
  coherentCount: BigNumberish
) => {
  const { core } = await getContracts();
  const { repartitions, drawnJurors } = await core.getRoundInfo(dispute.id, dispute.currentRoundIndex);
  return coherentCount === 0n
    ? drawnJurors.length - getNumber(repartitions)
    : 2 * drawnJurors.length - getNumber(repartitions);
};

const filterDisputesToSkip = (disputes: Dispute[]) => {
  logger.debug(
    `Skipping disputes: ${disputes
      .filter((dispute) => DISPUTES_TO_SKIP.includes(dispute.id))
      .map((dispute) => dispute.id)}`
  );
  return disputes.filter((dispute) => !DISPUTES_TO_SKIP.includes(dispute.id));
};

const mapAsync = <T, U>(array: T[], callbackfn: (value: T, index: number, array: T[]) => Promise<U>): Promise<U[]> => {
  return Promise.all(array.map(callbackfn));
};

const filterAsync = async <T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> => {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((value, index) => filterMap[index]);
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sendHeartbeat = async () => {
  if (HEARTBEAT_URL) {
    logger.debug("Sending heartbeat");
    fetch(HEARTBEAT_URL);
  } else {
    logger.debug("Heartbeat not set up, skipping");
  }
};

async function main() {
  const graphqlRequest = await import("graphql-request"); // Workaround graphql-request ESM import
  request = graphqlRequest.request;
  const { core, sortition, disputeKitClassic } = await getContracts();

  const getBlockTime = async () => {
    return await ethers.provider.getBlock("latest").then((block) => {
      if (block?.timestamp === undefined) return 0;
      return block?.timestamp;
    });
  };

  const hasMinStakingTimePassed = async (): Promise<boolean> => {
    const minStakingTime = await sortition.minStakingTime();
    const blockTime = await getBlockTime();
    return await sortition.lastPhaseChange().then((lastPhaseChange) => {
      return toBigInt(blockTime) - lastPhaseChange > minStakingTime;
    });
  };

  const hasMaxDrawingTimePassed = async (): Promise<boolean> => {
    const maxDrawingTime = await sortition.maxDrawingTime();
    const blockTime = await getBlockTime();
    return await sortition.lastPhaseChange().then((lastPhaseChange) => {
      return toBigInt(blockTime) - lastPhaseChange > maxDrawingTime;
    });
  };

  const isPhaseStaking = async (): Promise<boolean> => {
    return PHASES[getNumber(await sortition.phase())] === Phase.STAKING;
  };

  const isPhaseGenerating = async (): Promise<boolean> => {
    return PHASES[getNumber(await sortition.phase())] === Phase.GENERATING;
  };

  const isPhaseDrawing = async (): Promise<boolean> => {
    return PHASES[getNumber(await sortition.phase())] === Phase.DRAWING;
  };

  logger.info("Starting up");

  await sendHeartbeat();

  logger.info(`Current phase: ${PHASES[getNumber(await sortition.phase())]}`);

  // Retrieve the disputes which are in a non-final period
  let disputes = await getNonFinalDisputes().catch((e) => handleError(e));
  if (!disputes) {
    return;
  }

  let disputesWithoutJurors = await filterAsync(disputes, async (dispute) => {
    return !(await isDisputeFullyDrawn(dispute));
  });

  // Just a sanity check
  const numberOfDisputesWithoutJurors = await sortition.disputesWithoutJurors();
  if (!(numberOfDisputesWithoutJurors === toBigInt(disputesWithoutJurors.length))) {
    logger.error("Discrepancy between SortitionModule.disputesWithoutJurors and KlerosCore.disputes");
    logger.error(`KlerosCore.disputes without jurors = ${disputesWithoutJurors.length}`);
    logger.error(`SortitionModule.disputesWithoutJurors = ${numberOfDisputesWithoutJurors}`);
  }

  // Skip some disputes
  disputes = filterDisputesToSkip(disputes);
  disputesWithoutJurors = filterDisputesToSkip(disputesWithoutJurors);
  for (const dispute of disputes) {
    logger.info(`Dispute #${dispute.id}, round #${dispute.currentRoundIndex}, ${dispute.period} period`);
  }
  logger.info(`Disputes needing more jurors: ${disputesWithoutJurors.map((dispute) => dispute.id)}`);
  if ((await hasMinStakingTimePassed()) && disputesWithoutJurors.length > 0) {
    // ----------------------------------------------- //
    //                DRAWING ATTEMPT                  //
    // ----------------------------------------------- //
    logger.info("Attempting to draw jurors");
    if (await isPhaseStaking()) {
      await passPhase();
    }
    if (await isPhaseGenerating()) {
      let maxDrawingTimePassed = false;
      do {
        logger.info("Waiting for RNG to be ready");
        await delay(WAIT_FOR_RNG_DURATION);
        maxDrawingTimePassed = await hasMaxDrawingTimePassed();
      } while (!(await isRngReady()) && !maxDrawingTimePassed);
      await passPhase();
    }
    if (await isPhaseDrawing()) {
      let maxDrawingTimePassed = await hasMaxDrawingTimePassed();
      for (const dispute of disputesWithoutJurors) {
        if (maxDrawingTimePassed) {
          logger.info("Max drawing time passed");
          break;
        }
        let numberOfMissingJurors = await getMissingJurors(dispute);
        if (numberOfMissingJurors > MAX_JURORS_PER_DISPUTE) {
          logger.warn(`Skipping dispute #${dispute.id} with too many jurors to draw`);
          continue;
        }
        do {
          const drawIterations = Math.min(MAX_DRAW_ITERATIONS, getNumber(numberOfMissingJurors));
          logger.info(
            `Drawing ${drawIterations} out of ${numberOfMissingJurors} jurors needed for dispute #${dispute.id}`
          );
          if (!(await drawJurors(dispute, drawIterations))) {
            logger.info(`Failed to draw jurors for dispute #${dispute.id}, skipping it`);
            break;
          }
          await delay(ITERATIONS_COOLDOWN_PERIOD); // To avoid spiking the gas price
          maxDrawingTimePassed = await hasMaxDrawingTimePassed();
          numberOfMissingJurors = await getMissingJurors(dispute);
        } while (!(numberOfMissingJurors === 0n) && !maxDrawingTimePassed);
      }
      // At this point, either all disputes are fully drawn or max drawing time has passed
    }
  }

  // ----------------------------------------------- //
  //            BACK TO STAKING PHASE                //
  // ----------------------------------------------- //
  for (let i = 0; i < 3 && !(await isPhaseStaking()); i++) {
    await passPhase();
  }

  await sendHeartbeat();

  logger.info(`Current phase: ${PHASES[getNumber(await sortition.phase())]}`);

  for (const dispute of disputes) {
    // ----------------------------------------------- //
    //                  PASS PERIOD                    //
    // ----------------------------------------------- //
    await passPeriod(dispute);
  }

  // Get all the disputes whose ruling is not yet executed
  const unexecutedDisputes = await getDisputesWithUnexecutedRuling();
  logger.info(`Disputes not yet executed: ${unexecutedDisputes.map((dispute) => dispute.id)}`);

  // Get all disputes with contributions not yet withdrawn
  const disputesWithContributionsNotYetWithdrawn = await getDisputesWithContributionsNotYetWithdrawn();
  logger.info(
    `Disputes with contributions not yet withdrawn: ${disputesWithContributionsNotYetWithdrawn.map(
      (dispute) => dispute.id
    )}`
  );

  // Disputes union and deduplicate
  const unprocessedDisputesInExecution = filterDisputesToSkip(
    getUniqueDisputes(unexecutedDisputes.concat(disputesWithContributionsNotYetWithdrawn).concat(disputes))
  );
  logger.info(`Disputes not fully executed: ${unprocessedDisputesInExecution.map((dispute) => dispute.id)}`);

  for (const dispute of unprocessedDisputesInExecution) {
    const { period } = await core.disputes(dispute.id);
    if (period !== 4n) {
      logger.info(`Skipping dispute #${dispute.id} because it is not in the execution period`);
      continue;
    }

    // ----------------------------------------------- //
    //             REPARTITIONS EXECUTION              //
    // ----------------------------------------------- //
    const coherentCount = await disputeKitClassic.getCoherentCount(dispute.id, dispute.currentRoundIndex);
    let numberOfMissingRepartitions = await getNumberOfMissingRepartitions(dispute, coherentCount);
    do {
      const executeIterations = Math.min(MAX_EXECUTE_ITERATIONS, numberOfMissingRepartitions);
      if (executeIterations === 0) {
        continue;
      }
      logger.info(
        `Executing ${executeIterations} out of ${numberOfMissingRepartitions} repartitions needed for dispute #${dispute.id}`
      );
      if (!(await executeRepartitions(dispute, executeIterations))) {
        logger.info(`Failed to execute repartitions for dispute #${dispute.id}, skipping it`);
        break;
      }
      numberOfMissingRepartitions = await getNumberOfMissingRepartitions(dispute, coherentCount);
      await delay(ITERATIONS_COOLDOWN_PERIOD); // To avoid spiking the gas price
    } while (numberOfMissingRepartitions != 0);

    // ----------------------------------------------- //
    //               RULING EXECUTION                  //
    // ----------------------------------------------- //
    const { ruled } = await core.disputes(dispute.id);
    const { ruling } = await core.currentRuling(dispute.id);
    if (!ruled) {
      logger.info(`Executing ruling ${ruling} for dispute #${dispute.id}`);
      await executeRuling(dispute);
    } else {
      logger.info(`Ruling already executed for dispute #${dispute.id}`);
    }

    // ----------------------------------------------- //
    //      WITHDRAWAL OF THE APPEAL CONTRIBUTIONS     //
    // ----------------------------------------------- //
    let contributions = await getAppealContributions(dispute.id).catch((e) => handleError(e));
    if (!contributions) {
      continue;
    }
    // Remove contributions already withdrawn and those for other rounds
    contributions = contributions.filter((contribution) => {
      return !contribution.rewardWithdrawn && contribution.coreDispute.currentRoundIndex === dispute.currentRoundIndex;
    });
    // Remove duplicates which may have a different contribution amount for the same round, choice and beneficiary
    contributions = [...new Set(contributions)];
    for (let contribution of contributions) {
      // Could be improved by pinpointing exactly which round requires a withdrawal, just try all of them for now.
      for (let round = toBigInt(dispute.currentRoundIndex); round >= 0; round = round - 1n) {
        await withdrawAppealContribution(dispute.id, round.toString(), contribution);
        await delay(ITERATIONS_COOLDOWN_PERIOD); // To avoid spiking the gas price
      }
    }
  }

  logger.info(`Current phase: ${PHASES[getNumber(await sortition.phase())]}`);

  // ----------------------------------------------- //
  //             EXECUTE DELAYED STAKES              //
  // ----------------------------------------------- //

  if (await isPhaseStaking()) {
    await executeDelayedStakes();
  }

  await sendHeartbeat();

  logger.info("Shutting down");
  await delay(2000); // Some log messages may be lost otherwise
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    logger.flush();
  });
