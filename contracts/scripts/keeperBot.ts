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

const handleError = (e: any) => {
  if (typeof e === "string") {
    logger.error(e, "Transaction failed");
  } else if (e instanceof Error) {
    logger.error(e, "Transaction failed");
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
  try {
    await sortition.callStatic.passPhase();
  } catch (e) {
    logger.info(`passPhase: not ready yet`);
    return false;
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
    logger.info(`passPhase: ${before} -> ${after}`);
    return before !== after; // true if successful
  }
};

const passPeriod = async (dispute: { id: string }) => {
  const { core } = await getContracts();
  try {
    await core.callStatic.passPeriod(7);
  } catch (e) {
    logger.info(`passPeriod: not ready yet for dispute ${dispute.id}`);
    return false;
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
    return before !== after; // true if successful
  }
};

const drawJurors = async (dispute: { id: string; currentRoundIndex: string }, drawIterations: number) => {
  const { core } = await getContracts();
  let success = false;
  try {
    await core.callStatic.draw(dispute.id, drawIterations, HIGH_GAS_LIMIT);
  } catch (e) {
    logger.info(`Draw: will fail for ${dispute.id}, skipping`);
    return success;
  }
  try {
    const tx = await (await core.draw(dispute.id, drawIterations, HIGH_GAS_LIMIT)).wait();
    logger.info(`Draw txID: ${tx?.transactionHash}`);
    success = true;
  } catch (e) {
    handleError(e);
  } finally {
    const roundInfo = await core.getRoundInfo(dispute.id, dispute.currentRoundIndex);
    logger.info(`Drawn jurors (last 20): ${roundInfo.drawnJurors.slice(-20)}`);
    return success;
  }
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
    return (await sortition.phase()) === 0;
  };

  const isPhaseGenerating = async (): Promise<boolean> => {
    return (await sortition.phase()) === 1;
  };

  const isPhaseDrawing = async (): Promise<boolean> => {
    return (await sortition.phase()) === 2;
  };

  await sendHeartbeat();

  // get all the non-final disputes
  const nonFinalDisputesRequest = `{
    disputes(where: {period_not: execution}) {
      period
      id
      currentRoundIndex
    }
  }`;

  // TODO: use a local graph node if chainId is HARDHAT
  const result = await request(
    "https://api.thegraph.com/subgraphs/name/alcercu/kleroscoretest",
    nonFinalDisputesRequest
  );

  const { disputes } = result as { disputes: { period: string; id: string; currentRoundIndex: string }[] };
  for (var dispute of disputes) {
    logger.info(`dispute #${dispute.id}, round #${dispute.currentRoundIndex}, ${dispute.period} period`);
  }

  const disputesWithoutJurors = await filterAsync(disputes, async (dispute) => {
    return !(await isDisputeFullyDrawn(dispute));
  });
  logger.info(`disputes needing more jurors: ${disputesWithoutJurors.map((dispute) => dispute.id)}`);

  // Just a sanity check
  const numberOfDisputesWithoutJurors = await sortition.disputesWithoutJurors();
  if (!numberOfDisputesWithoutJurors.eq(disputesWithoutJurors.length)) {
    console.error("Discrepancy between SortitionModule.disputesWithoutJurors and KlerosCore.disputes");
    console.error(`KlerosCore.disputes without jurors = ${disputesWithoutJurors.length}`);
    console.error(`SortitionModule.disputesWithoutJurors = ${numberOfDisputesWithoutJurors}`);
  }

  if ((await hasMinStakingTimePassed()) && disputesWithoutJurors.length > 0) {
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
      // At this point, either all disputes are fully drawn or max drawing time has passed
      let i = 0;
      while (!(await isPhaseStaking()) && i++ < 3) {
        await passPhase();
      }
    }
  }

  await sendHeartbeat();

  for (dispute of disputes) {
    await passPeriod(dispute);

    const { period } = await core.disputes(dispute.id);
    if (period === 4) {
      // Execution period
      const coherentCount = await disputeKitClassic.getCoherentCount(dispute.id, dispute.currentRoundIndex);
      let numberOfMissingRepartitions = await getNumberOfMissingRepartitions(dispute, coherentCount);
      do {
        const executeIterations = Math.min(MAX_EXECUTE_ITERATIONS, numberOfMissingRepartitions);
        logger.info(
          `Executing ${executeIterations} out of ${numberOfMissingRepartitions} repartitions needed for dispute #${dispute.id}`
        );
        await core.execute(dispute.id, dispute.currentRoundIndex, executeIterations, HIGH_GAS_LIMIT);
        numberOfMissingRepartitions = await getNumberOfMissingRepartitions(dispute, coherentCount);
        await delay(ITERATIONS_COOLDOWN_PERIOD); // To avoid spiking the gas price
      } while (numberOfMissingRepartitions != 0);

      const { ruled } = await core.disputes(dispute.id);
      const { ruling } = await core.currentRuling(dispute.id);
      if (!ruled) {
        logger.info(`Executing ruling ${ruling} for dispute #${dispute.id}`);
        const gas = (await core.estimateGas.executeRuling(dispute.id)).mul(150).div(100); // 50% extra gas
        await core.executeRuling(dispute.id, { gasLimit: gas });
      }

      // TODO: withdraw appeal funding contributions
      // await disputeKitClassic.withdrawFeesAndRewards(dispute.id, beneficiary, dispute.currentRoundIndex, choice);
    }
  }

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
