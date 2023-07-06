import { DisputeKitClassic, KlerosCore, PNK, RandomizerRNG, SortitionModule } from "../typechain-types";
import request from "graphql-request";
import env from "./utils/env";
import loggerFactory from "./utils/logger";
import hre = require("hardhat");

const { ethers } = hre;
const { BigNumber } = ethers;
const MAX_DRAW_ITERATIONS = 30;
const MAX_EXECUTE_ITERATIONS = 20;
const WAIT_FOR_RNG_DURATION = 5 * 1000; // 5 seconds
const ITERATIONS_COOLDOWN_PERIOD = 20 * 1000; // 20 seconds
const HIGH_GAS_LIMIT = { gasLimit: 50000000 }; // 50M gas
const HEARTBEAT_URL = env.optionalNoDefault("HEARTBEAT_URL_KEEPER_BOT");
const SUBGRAPH_URL = env.require("SUBGRAPH_URL");

const loggerOptions = env.optionalNoDefault("LOGTAIL_TOKEN")
  ? {
      transportTargetOptions: {
        target: "@logtail/pino",
        options: { sourceToken: env.require("LOGTAIL_TOKEN") },
        level: env.optional("LOG_LEVEL", "info"),
      },
      level: env.optional("LOG_LEVEL", "info"), // for pino-pretty
    }
  : {};
const logger = loggerFactory.createLogger(loggerOptions);

const getContracts = async () => {
  const core = (await ethers.getContract("KlerosCore")) as KlerosCore;
  const sortition = (await ethers.getContract("SortitionModule")) as SortitionModule;
  const randomizerRng = (await ethers.getContract("RandomizerRNG")) as RandomizerRNG;
  const disputeKitClassic = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
  const pnk = (await ethers.getContract("PNK")) as PNK;
  return { core, sortition, randomizerRng, disputeKitClassic, pnk };
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
  if (typeof e === "string") {
    logger.error(e, "Failure");
  } else if (e instanceof Error) {
    logger.error(e, "Failure");
  }
};

const isRngReady = async () => {
  const { randomizerRng, sortition } = await getContracts();
  const requesterID = await randomizerRng.requesterToID(sortition.address);
  const n = await randomizerRng.randomNumbers(requesterID);
  if (Number(n) === 0) {
    logger.info("RandomizerRNG is NOT ready yet");
    return false;
  } else {
    logger.info(`RandomizerRNG is ready: ${n.toString()}`);
    return true;
  }
};

const passPhase = async () => {
  const { sortition } = await getContracts();
  let success = false;
  try {
    await sortition.callStatic.passPhase();
  } catch (e) {
    logger.info(`passPhase: not ready yet because of ${(e as CustomError).reason}`);
    return success;
  }
  const before = await sortition.phase();
  try {
    const gas = (await sortition.estimateGas.passPhase()).mul(150).div(100); // 50% extra gas
    const tx = await (await sortition.passPhase({ gasLimit: gas })).wait();
    logger.info(`passPhase txID: ${tx?.transactionHash}`);
  } catch (e) {
    handleError(e);
  } finally {
    const after = await sortition.phase();
    logger.info(`passPhase: ${PHASES[before]} -> ${PHASES[after]}`);
    success = before !== after; // true if successful
  }
  return success;
};

const passPeriod = async (dispute: { id: string }) => {
  const { core } = await getContracts();
  let success = false;
  try {
    await core.callStatic.passPeriod(dispute.id);
  } catch (e) {
    logger.info(`passPeriod: not ready yet for dispute ${dispute.id} because of error ${(e as CustomError).errorName}`);
    return success;
  }
  const before = (await core.disputes(dispute.id)).period;
  try {
    const gas = (await core.estimateGas.passPeriod(dispute.id)).mul(150).div(100); // 50% extra gas
    const tx = await (await core.passPeriod(dispute.id, { gasLimit: gas })).wait();
    logger.info(`passPeriod txID: ${tx?.transactionHash}`);
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
    await core.callStatic.draw(dispute.id, iterations, HIGH_GAS_LIMIT);
  } catch (e) {
    logger.info(`Draw: will fail for ${dispute.id}, skipping`);
    return success;
  }
  try {
    const tx = await (await core.draw(dispute.id, iterations, HIGH_GAS_LIMIT)).wait();
    logger.info(`Draw txID: ${tx?.transactionHash}`);
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
    await core.callStatic.execute(dispute.id, dispute.currentRoundIndex, iterations, HIGH_GAS_LIMIT);
  } catch (e) {
    logger.info(`Execute: will fail for ${dispute.id}, skipping`);
    return success;
  }
  try {
    const tx = await (await core.execute(dispute.id, dispute.currentRoundIndex, iterations, HIGH_GAS_LIMIT)).wait();
    logger.info(`Execute txID: ${tx?.transactionHash}`);
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
    await core.callStatic.executeRuling(dispute.id);
  } catch (e) {
    logger.info(`ExecuteRuling: will fail for ${dispute.id}, skipping`);
    return success;
  }
  try {
    const gas = (await core.estimateGas.executeRuling(dispute.id)).mul(150).div(100); // 50% extra gas
    const tx = await (await core.executeRuling(dispute.id, { gasLimit: gas })).wait();
    logger.info(`ExecuteRuling txID: ${tx?.transactionHash}`);
    success = true;
  } catch (e) {
    handleError(e);
  }
  return success;
};

const withdrawAppealContribution = async (dispute: Dispute, contribution: Contribution): Promise<boolean> => {
  const { disputeKitClassic: kit } = await getContracts();
  let success = false;
  try {
    logger.info(
      `Withdrawing appeal contribution for dispute #${dispute.id}, round #${dispute.currentRoundIndex}, choice ${contribution.choice} and beneficiary ${contribution.contributor.id}  `
    );
    const gas = (
      await kit.estimateGas.withdrawFeesAndRewards(
        dispute.id,
        contribution.contributor.id,
        dispute.currentRoundIndex,
        contribution.choice
      )
    )
      .mul(150)
      .div(100); // 50% extra gas
    await kit.withdrawFeesAndRewards(
      dispute.id,
      contribution.contributor.id,
      dispute.currentRoundIndex,
      contribution.choice,
      { gasLimit: gas }
    );
    success = true;
  } catch (e) {
    handleError(e);
  }
  return success;
};

const getMissingJurors = async (dispute: { id: string; currentRoundIndex: string }) => {
  const { core } = await getContracts();
  const { nbVotes, drawnJurors } = await core.getRoundInfo(dispute.id, dispute.currentRoundIndex);
  return nbVotes.sub(drawnJurors.length);
};

const isDisputeFullyDrawn = async (dispute: { id: string; currentRoundIndex: string }): Promise<boolean> => {
  return (await getMissingJurors(dispute)).eq(0);
};

const getNumberOfMissingRepartitions = async (
  dispute: { id: string; currentRoundIndex: string },
  coherentCount: BigNumber
) => {
  const { core } = await getContracts();
  const { repartitions, drawnJurors } = await core.getRoundInfo(dispute.id, dispute.currentRoundIndex);
  return coherentCount.eq(0)
    ? drawnJurors.length - repartitions.toNumber()
    : 2 * drawnJurors.length - repartitions.toNumber();
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendHeartbeat = async () => {
  if (HEARTBEAT_URL) {
    logger.debug("Sending heartbeat");
    fetch(HEARTBEAT_URL);
  } else {
    logger.debug("Heartbeat not set up, skipping");
  }
};

async function main() {
  const { core, sortition, disputeKitClassic } = await getContracts();

  const getBlockTime = async () => {
    return await ethers.provider.getBlock("latest").then((block) => {
      return BigNumber.from(block.timestamp);
    });
  };

  const hasMinStakingTimePassed = async (): Promise<boolean> => {
    const minStakingTime = await sortition.minStakingTime();
    const blockTime = await getBlockTime();
    return await sortition.lastPhaseChange().then((lastPhaseChange) => {
      return blockTime.sub(lastPhaseChange).gt(minStakingTime);
    });
  };

  const hasMaxDrawingTimePassed = async (): Promise<boolean> => {
    const maxDrawingTime = await sortition.maxDrawingTime();
    const blockTime = await getBlockTime();
    return await sortition.lastPhaseChange().then((lastPhaseChange) => {
      return blockTime.sub(lastPhaseChange).gt(maxDrawingTime);
    });
  };

  const isPhaseStaking = async (): Promise<boolean> => {
    return PHASES[await sortition.phase()] === Phase.STAKING;
  };

  const isPhaseGenerating = async (): Promise<boolean> => {
    return PHASES[await sortition.phase()] === Phase.GENERATING;
  };

  const isPhaseDrawing = async (): Promise<boolean> => {
    return PHASES[await sortition.phase()] === Phase.DRAWING;
  };

  await sendHeartbeat();

  logger.info(`Current phase: ${PHASES[await sortition.phase()]}`);

  const disputes = await getNonFinalDisputes().catch((e) => handleError(e));
  if (!disputes) {
    return;
  }
  for (var dispute of disputes) {
    logger.info(`Dispute #${dispute.id}, round #${dispute.currentRoundIndex}, ${dispute.period} period`);
  }

  const disputesWithoutJurors = await filterAsync(disputes, async (dispute) => {
    return !(await isDisputeFullyDrawn(dispute));
  });
  logger.info(`Disputes needing more jurors: ${disputesWithoutJurors.map((dispute) => dispute.id)}`);

  // Just a sanity check
  const numberOfDisputesWithoutJurors = await sortition.disputesWithoutJurors();
  if (!numberOfDisputesWithoutJurors.eq(disputesWithoutJurors.length)) {
    logger.error("Discrepancy between SortitionModule.disputesWithoutJurors and KlerosCore.disputes");
    logger.error(`KlerosCore.disputes without jurors = ${disputesWithoutJurors.length}`);
    logger.error(`SortitionModule.disputesWithoutJurors = ${numberOfDisputesWithoutJurors}`);
  }

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
      for (dispute of disputesWithoutJurors) {
        if (maxDrawingTimePassed) {
          logger.info("Max drawing time passed");
          break;
        }
        let numberOfMissingJurors = await getMissingJurors(dispute);
        do {
          const drawIterations = Math.min(MAX_DRAW_ITERATIONS, numberOfMissingJurors.toNumber());
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
        } while (!numberOfMissingJurors.eq(0) && !maxDrawingTimePassed);
      }

      // ----------------------------------------------- //
      //            BACK TO STAKING PHASE                //
      // ----------------------------------------------- //
      // At this point, either all disputes are fully drawn or max drawing time has passed
      let i = 0;
      while (!(await isPhaseStaking()) && i++ < 3) {
        await passPhase();
      }
    }
  }

  await sendHeartbeat();

  logger.info(`Current phase: ${PHASES[await sortition.phase()]}`);

  for (var dispute of disputes) {
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
  const unprocessedDisputesInExecution = getUniqueDisputes(
    unexecutedDisputes.concat(disputesWithContributionsNotYetWithdrawn).concat(disputes)
  );
  logger.info(`Disputes not fully executed: ${unprocessedDisputesInExecution.map((dispute) => dispute.id)}`);

  for (var dispute of unprocessedDisputesInExecution) {
    const { period } = await core.disputes(dispute.id);
    if (period !== 4) {
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
    for (var contribution of contributions) {
      await withdrawAppealContribution(dispute, contribution);
      await delay(ITERATIONS_COOLDOWN_PERIOD); // To avoid spiking the gas price
    }
  }

  logger.info(`Current phase: ${PHASES[await sortition.phase()]}`);

  // ----------------------------------------------- //
  //             EXECUTE DELAYED STAKES              //
  // ----------------------------------------------- //
  // delayedStakes = 1 + delayedStakeWriteIndex - delayedStakeReadIndex
  const delayedStakes = BigNumber.from(1)
    .add(await sortition.delayedStakeWriteIndex())
    .sub(await sortition.delayedStakeReadIndex());

  if (await isPhaseStaking()) {
    if (delayedStakes.gt(0)) {
      logger.info("Executing delayed stakes");
      await sortition.executeDelayedStakes(delayedStakes);
    } else {
      logger.info("No delayed stakes to execute");
    }
  }

  await sendHeartbeat();

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
