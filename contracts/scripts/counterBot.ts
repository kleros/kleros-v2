import env from "./utils/env";
import loggerFactory from "./utils/logger";
import hre = require("hardhat");
import { KlerosCore, DisputeResolver, SortitionModule } from "../typechain-types";
import { BigNumber } from "ethers";
const { ethers } = hre;

const HEARTBEAT_URL = undefined; //env.optionalNoDefault("HEARTBEAT_URL_DISPUTOR_BOT");
const loggerOptions = env.optionalNoDefault("LOGTAIL_TOKEN_COUNTER_BOT")
  ? {
      transportTargetOptions: {
        target: "@logtail/pino",
        options: { sourceToken: env.require("LOGTAIL_TOKEN_COUNTER_BOT") },
        level: env.optional("LOG_LEVEL", "info"),
      },
      level: env.optional("LOG_LEVEL", "info"), // for pino-pretty
    }
  : {};
const logger = loggerFactory.createLogger(loggerOptions);

const enum Phase {
  staking, // No disputes that need drawing.
  generating, // Waiting for a random number. Pass as soon as it is ready.
  drawing, // Jurors can be drawn.
}

export default async function main() {
  logger.info("Starting up");

  const core = (await ethers.getContract("KlerosCore")) as KlerosCore;
  const sortition = (await ethers.getContract("SortitionModule")) as SortitionModule;
  const resolver = (await ethers.getContract("DisputeResolver")) as DisputeResolver;

  if (HEARTBEAT_URL) {
    logger.debug("Sending heartbeat");
    fetch(HEARTBEAT_URL);
  } else {
    logger.debug("Heartbeat not set up, skipping");
  }

  const phase = await sortition.phase();
  const now = (await ethers.provider.getBlock("latest")).timestamp;
  const lastPhaseChange = await sortition.lastPhaseChange();
  const durationInPhase = now - lastPhaseChange.toNumber();

  let remainingTimeInPhase: number | undefined;

  if (phase === Phase.staking) {
    logger.debug("Phase is staking");
    const disputesWithoutJurors = await sortition.disputesWithoutJurors();
    if (disputesWithoutJurors.gt(0)) {
      remainingTimeInPhase = await sortition
        .minStakingTime()
        .then((minStakingTime) => (minStakingTime.sub(durationInPhase).lte(0) ? 0 : undefined));
    }
  } else {
    logger.debug("Phase is generating or drawing");
    remainingTimeInPhase = await sortition
      .maxDrawingTime()
      .then((maxDrawingTime) => maxDrawingTime.sub(durationInPhase).toNumber());
  }
  logger.info({ phase, durationInPhase, remainingTimeInPhase }, "data");
  await delay(1000);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    logger.flush();
  });
